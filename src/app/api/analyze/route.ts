import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// Analysis Engine - Force Reload: 2026-04-18T22:45:00
export async function POST(request: Request) {
  try {
    console.log("[X-Ray] POST /api/analyze called");
    
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("[X-Ray] CRITICAL: OPENROUTER_API_KEY is missing.");
      return NextResponse.json({ error: "Server configuration error: Missing API Key" }, { status: 500 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log("[X-Ray] OPENROUTER_API_KEY validated successfully.");

    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "FinSight Analysis",
      },
      timeout: 45000, 
    });
    
    let text: string | null = null;
    const formData = await request.formData();
    text = formData.get("text") as string | null;
    const file = formData.get("pdf") as File | null;

    if (file) {
      // @ts-ignore - implicitly any
      const pdf = await import("pdf-parse/lib/pdf-parse.js");
      const buffer = Buffer.from(await file.arrayBuffer());
      const data = await pdf.default(buffer);
      text = data.text;
    }

    if (!text || text.trim().length === 0 || text === "PDF File loaded. Ready to analyze...") {
      return NextResponse.json({ error: "No text or invalid PDF provided" }, { status: 400 });
    }

    const documentText = text.trim();
    const CHUNK_SIZE = 1000; 
    const chunks: { text: string, offset: number }[] = [];
    
    let currentPos = 0;
    while (currentPos < documentText.length) {
      let endPos = currentPos + CHUNK_SIZE;
      if (endPos < documentText.length) {
        const lastNewline = documentText.lastIndexOf('\n', endPos);
        if (lastNewline > currentPos + 200) {
          endPos = lastNewline;
        }
      } else {
        endPos = documentText.length;
      }
      chunks.push({ text: documentText.substring(currentPos, endPos), offset: currentPos });
      currentPos = endPos;
    }

    const chunkPromises = chunks.map(async (chunkObj, index) => {
      const { text: chunk, offset } = chunkObj;
      
      const fetchAnalysis = async (retry = true): Promise<any> => {
        try {
          const response = await client.chat.completions.create({
            messages: [
              { 
                role: "system",
                content: `JSON only. Schema: { "summary": { "overview": "", "risk_level": "Low|Medium|High", "key_facts": [], "key_risks": [] }, "clauses": [{ "text": "", "type": "high_risk|warning|favorable", "reason": "" }], "metrics": { "interest_rate": "", "penalty_apr": "", "fees": [], "loan_amount": "", "tenure": "" } }`
              },
              { role: "user", content: `Chunk: ${chunk}` }
            ],
            model: "gpt-4o-mini",
            temperature: 0,
            max_tokens: 600,
            response_format: { type: "json_object" }
          });

          const raw = response.choices[0].message.content;
          
          if (!raw || !raw.trim().startsWith("{")) {
            throw new Error("Invalid AI response: Does not start with JSON object.");
          }

          const parsed = JSON.parse(raw);
          if (!parsed.summary || !parsed.clauses) {
            throw new Error("Invalid schema: Missing clauses or summary");
          }
          if (!parsed.metrics) {
            parsed.metrics = { interest_rate: "--", penalty_apr: "--", fees: [], tenure: "--", loan_amount: "--" };
          }
          return parsed;
        } catch (err: any) {
          if (retry) return fetchAnalysis(false);
          return {
            summary: { overview: "Extraction incomplete.", risk_level: "Medium", key_facts: [], key_risks: [] },
            clauses: [],
            metrics: { interest_rate: "--", penalty_apr: "--", fees: [], tenure: "--", loan_amount: "--" }
          };
        }
      };

      const parsed = await fetchAnalysis();
      
      const adjustedClauses = (parsed.clauses || []).map((c: any) => ({
        ...c,
        start: typeof c.start === 'number' ? c.start + offset : -1,
        end: typeof c.end === 'number' ? c.end + offset : -1
      }));

      return { ...parsed, clauses: adjustedClauses };
    });

    const chunkResults = await Promise.all(chunkPromises);

    if (chunkResults.length === 0) {
      return NextResponse.json({ error: "AI Extraction Failed: No data processed." }, { status: 422 });
    }

    const allClauses = chunkResults.flatMap(r => r.clauses || []);
    const uniqueClauses = Array.from(new Map(allClauses.map(c => [`${c.start}-${c.end}-${c.text}`, c])).values());

    const allFees = new Set<string>();
    let maxInterestRate = "--";
    let maxPenaltyApr = "--";
    let tenure = "--";
    let loanAmount = "--";

    chunkResults.forEach(r => {
      const m = r.metrics || {};
      if (m.fees) m.fees.forEach((f: string) => allFees.add(f));
      if (m.interest_rate && m.interest_rate !== "..." && m.interest_rate !== "N/A" && m.interest_rate !== "TBD" && m.interest_rate !== "--") maxInterestRate = m.interest_rate;
      if (m.penalty_apr && m.penalty_apr !== "..." && m.penalty_apr !== "N/A" && m.penalty_apr !== "TBD" && m.penalty_apr !== "--") maxPenaltyApr = m.penalty_apr;
      if (m.tenure && m.tenure !== "..." && m.tenure !== "N/A" && m.tenure !== "TBD" && m.tenure !== "--") tenure = m.tenure;
      if (m.loan_amount && m.loan_amount !== "..." && m.loan_amount !== "N/A" && m.loan_amount !== "TBD" && m.loan_amount !== "--") loanAmount = m.loan_amount;
    });

    const riskLevels = chunkResults.map(r => r.summary?.risk_level || "Low");
    const finalRiskLevel = riskLevels.includes("High") ? "High" : riskLevels.includes("Medium") ? "Medium" : "Low";
    
    const overviews = chunkResults.map(r => r.summary?.overview).filter(Boolean);
    const finalOverview = overviews.length > 0 ? overviews.join(" ") : "No high-impact financial risks identified.";
    
    const allKeyFacts = Array.from(new Set(chunkResults.flatMap(r => r.summary?.key_facts || [])));
    const allKeyRisks = Array.from(new Set(chunkResults.flatMap(r => r.summary?.key_risks || [])));
    
    const finalSummary = {
      overview: finalOverview,
      risk_level: finalRiskLevel,
      key_facts: allKeyFacts.slice(0, 6),
      key_risks: allKeyRisks.slice(0, 6)
    };

    const finalResult = {
      summary: finalSummary,
      metrics: {
        interest_rate: maxInterestRate,
        penalty_apr: maxPenaltyApr,
        fees: Array.from(allFees),
        tenure: tenure,
        loan_amount: loanAmount
      },
      clauses: uniqueClauses,
      score: finalRiskLevel === "High" ? 2.5 : finalRiskLevel === "Medium" ? 6.0 : 9.0,
      parsedText: documentText
    };

    if (!finalResult.summary || !finalResult.metrics || !finalResult.clauses) {
      return NextResponse.json({ error: "Synthesized data is incomplete." }, { status: 500 });
    }

    return NextResponse.json(finalResult);

  } catch (error: any) {
    console.error("Critical Analysis Error:", error);
    return NextResponse.json({ 
      error: error.message || "Financial analysis system encountered an internal fault.",
      raw: null
    }, { status: 500 });
  }
}
