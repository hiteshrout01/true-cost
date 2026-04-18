import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// Analysis Engine - Force Reload: 2026-04-18T22:45:00
export async function POST(request: Request) {
  console.log("[X-Ray] POST /api/analyze called");
  
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("[X-Ray] CRITICAL: OPENROUTER_API_KEY is missing from environment variables.");
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log("[X-Ray] OPENROUTER_API_KEY validated successfully.");

  let text: string | null = null;
  try {

    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "FinSight Analysis",
      },
      timeout: 45000, // Increased timeout for complex PDFs
    });
    
    const formData = await request.formData();
    text = formData.get("text") as string | null;
    const pdfFile = formData.get("pdf") as File | null;

    if (pdfFile) {
      console.log(`[X-Ray] Received PDF: ${pdfFile.name} (${pdfFile.size} bytes)`);
      const buffer = Buffer.from(await pdfFile.arrayBuffer());
      try {
        const pdfParse = require("pdf-parse"); 
        const pdfData = await pdfParse(buffer);
        text = pdfData.text;
        console.log(`[X-Ray] PDF Extraction Success. First 50 chars: "${text?.substring(0, 50).trim()}"`);
      } catch (pdfErr: any) {
        console.error("[X-Ray] PDF parse error:", pdfErr);
        const rawText = buffer.toString("utf-8");
        const nonPrintables = (rawText.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g) || []).length;
        if (nonPrintables < rawText.length * 0.1 && rawText.trim().length > 0) {
           text = rawText;
        } else {
           throw new Error(`Failed to parse PDF document. Error: ${pdfErr.message}. Please use text input instead.`);
        }
      }
    }

    if (!text || text.trim().length === 0 || text === "PDF File loaded. Ready to analyze...") {
      return NextResponse.json({ error: "No text or invalid PDF provided" }, { status: 400 });
    }

    const documentText = text;
    const CHUNK_SIZE = 8000; 
    const chunks: string[] = [];
    
    let currentPos = 0;
    while (currentPos < text.length) {
      let endPos = currentPos + CHUNK_SIZE;
      if (endPos < text.length) {
        const lastNewline = text.lastIndexOf('\n', endPos);
        if (lastNewline > currentPos + 4000) {
          endPos = lastNewline;
        }
      } else {
        endPos = text.length;
      }
      chunks.push(text.substring(currentPos, endPos));
      currentPos = endPos;
    }

    console.log(`[X-Ray] Starting analysis for ${chunks.length} chunks...`);

    const chunkPromises = chunks.map(async (chunk, index) => {
      const isFirstChunk = index === 0;
      
      const fetchAnalysis = async (retry = true): Promise<any> => {
        const response = await client.chat.completions.create({
          messages: [
            { 
              role: "system",
              content: `Return ONLY valid JSON. Do not include any text, explanation, or markdown. Output must start with { and end with }.
              
              You are a high-fidelity financial document analyzer. Provide a balanced analysis: capture all critical risks without being overly strict. 

              STRICT OUTPUT STRUCTURE (JSON):
              {
                "summary": {
                  "overview": "2-3 factual sentences. No fluff. No generic adjectives.",
                  "risk_level": "Low | Medium | High",
                  "key_facts": ["Bullet point with exact numbers ($ or %)"],
                  "key_risks": ["Specific consequence and trigger condition"]
                },
                "clauses": [
                  {
                    "text": "FULL sentence from document",
                    "type": "high_risk | warning | favorable",
                    "reason": "Specific impact summary"
                  }
                ],
                "metrics": {
                  "interest_rate": "...",
                  "penalty_apr": "...",
                  "fees": ["List specific $ amounts"],
                  "loan_amount": "...",
                  "tenure": "..."
                }
              }

              STRICT RULES:
              1. NO GENERIC PHRASES: Avoid 'substantial', 'significant'.
              2. ALWAYS INCLUDE NUMBERS: Facts must have values (e.g. 26% APR, $95 fee).
              3. NO HALLUCINATIONS: Only what is explicitly in the text.
              4. FULL SENTENCES: 'text' MUST be a complete sentence.
              5. CLASSIFICATION: high_risk (APR spikes, default), warning (late fees), favorable (0% terms).`
            },
            { role: "user", content: `Analyze this text chunk: ${chunk}` }
          ],
          model: "gpt-4o-mini",
          temperature: 0,
          max_tokens: 4096,
          response_format: { type: "json_object" }
        });

        const raw = response.choices[0].message.content;
        console.log("AI RAW RESPONSE:", raw);
        
        if (!raw || !raw.trim().startsWith("{")) {
          throw new Error("Invalid AI response: Does not start with JSON object.");
        }

        try {
          const parsed = JSON.parse(raw);
          // Validation Layer: Must have clauses and summary
          if (!parsed.summary || !parsed.clauses) {
            console.error("[X-Ray] Missing required top-level fields in chunk result:", raw);
            const error: any = new Error("Invalid schema: Missing clauses or summary");
            error.raw = raw;
            throw error;
          }
          // Default metrics if missing
          if (!parsed.metrics) {
            parsed.metrics = { interest_rate: "--", penalty_apr: "--", fees: [], tenure: "--", loan_amount: "--" };
          }
          return parsed;
        } catch (err: any) {
          if (retry) {
            console.warn(`[X-Ray] Malformed response (retry ${retry}): ${err.message}`);
            return fetchAnalysis(false);
          }
          if (!err.raw) err.raw = raw;
          throw err;
        }
      };

      try {
        const parsed = await fetchAnalysis();
        if (!parsed) return null;

        const offset = documentText.indexOf(chunk);
        
        // Adjust indices
        const adjustedClauses = (parsed.clauses || []).map((c: any) => ({
          ...c,
          start: typeof c.start === 'number' ? c.start + offset : -1,
          end: typeof c.end === 'number' ? c.end + offset : -1
        }));

        return { ...parsed, clauses: adjustedClauses };
      } catch (err: any) {
        console.error(`[X-Ray] Chunk ${index} failure:`, err.message);
        return null; // Return null so filter(Boolean) removes it, but other chunks persist
      }
    });

    const results = await Promise.all(chunkPromises);
    const chunkResults = results.filter(Boolean);

    if (chunkResults.length === 0) {
      return NextResponse.json({ 
        error: "AI Extraction Failed: No significant financial data could be processed from this document. Please ensure the document contains clear financial terms." 
      }, { status: 422 });
    }

    // Restoration: Deduplication & Merging match pre-deployment behavior
    const allClauses = chunkResults.flatMap(r => r.clauses || []);
    const uniqueClauses = Array.from(new Map(allClauses.map(c => [`${c.start}-${c.end}-${c.text}`, c])).values());

    // Merging of Metrics (Aggregate All)
    const allFees = new Set<string>();
    let maxInterestRate = "--";
    let maxPenaltyApr = "--";
    let tenure = "--";
    let loanAmount = "--";

    chunkResults.forEach(r => {
      const m = r.metrics || {};
      if (m.fees) m.fees.forEach((f: string) => allFees.add(f));
      if (m.interest_rate && m.interest_rate !== "..." && m.interest_rate !== "N/A" && m.interest_rate !== "TBD") maxInterestRate = m.interest_rate;
      if (m.penalty_apr && m.penalty_apr !== "..." && m.penalty_apr !== "N/A" && m.penalty_apr !== "TBD") maxPenaltyApr = m.penalty_apr;
      if (m.tenure && m.tenure !== "..." && m.tenure !== "N/A" && m.tenure !== "TBD") tenure = m.tenure;
      if (m.loan_amount && m.loan_amount !== "..." && m.loan_amount !== "N/A" && m.loan_amount !== "TBD") loanAmount = m.loan_amount;
    });

    // Synthesize Final Summary from all finding (Restored Logic)
    const riskLevels = chunkResults.map(r => r.summary?.risk_level || "Low");
    const finalRiskLevel = riskLevels.includes("High") ? "High" : riskLevels.includes("Medium") ? "Medium" : "Low";
    
    // Concatenate overview strings for a complete summary
    const overviews = chunkResults.map(r => r.summary?.overview).filter(Boolean);
    const finalOverview = overviews.length > 0 ? overviews.join(" ") : "No high-impact financial risks identified.";
    
    // Aggregate key points from all chunks
    const allKeyFacts = Array.from(new Set(chunkResults.flatMap(r => r.summary?.key_facts || [])));
    const allKeyRisks = Array.from(new Set(chunkResults.flatMap(r => r.summary?.key_risks || [])));
    
    // Final Summary Aggregation
    const finalSummary = {
      overview: finalOverview,
      risk_level: chunkResults.some(r => r.summary.risk_level === 'High') ? 'High' : 
                  chunkResults.some(r => r.summary.risk_level === 'Medium') ? 'Medium' : 'Low',
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

    return NextResponse.json(finalResult);

  } catch (error: any) {
    console.error("Critical AI Analysis Error:", error);
    return NextResponse.json({ 
      error: error.message || "Financial analysis system unavailable.",
      raw: error.raw || null
    }, { status: 500 });
  }
}
