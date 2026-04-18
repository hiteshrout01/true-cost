import { OpenAI } from "openai";
import { NextResponse } from "next/server";
const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1", // Using user provided OpenRouter
  apiKey: "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",
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    let text = formData.get("text") as string | null;
    const pdfFile = formData.get("pdf") as File | null;

    if (pdfFile) {
      const pdfParse = require("pdf-parse"); // Dynamic import to prevent build errors
      const buffer = Buffer.from(await pdfFile.arrayBuffer());
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "No text or invalid PDF provided" }, { status: 400 });
    }

    // Optional: limit text size if documents are too huge
    if (text.length > 100000) {
      text = text.substring(0, 100000);
    }

    const response = await client.chat.completions.create({
      messages: [
        { 
          role: "system",
          content: `You are a high-precision financial intelligence system designed to analyze complex financial agreements and expose their true cost, risks, and hidden conditions. Your goal is NOT just to summarize — but to reveal what the user might miss.

Your task is to analyze the provided financial document and extract the following structured information in JSON format ONLY:

1. "score": A transparency/safety score from 0.0 (extremely risky/predatory) to 10.0 (completely safe and transparent). Return as a number.
2. "scoreBreakdown": An array of exactly 3 to 5 objects driving the score logic. E.g. [{"factor": "High APR", "impact": -3}, {"factor": "Hidden Fees", "impact": -2}, {"factor": "Favorable Offer", "impact": 1.5}]. Real numbers evaluating positive or negative impact points!
3. "riskCategory": One of "Low Risk", "Medium Risk", or "High Risk".
4. "insights": An object containing "apr", "tenure", and "principal" extracted from the text. IMPORTANT: Convert any Dollar ($) amounts to Indian Rupee (₹) using an approximate exchange rate (e.g., 1 USD = 83 INR) and use INR for all financial values. If not found, use "--".
4. "high_risk": An EXHAUSTIVE array of objects representing high-risk clauses from the document (e.g. penalty APR, late fees, variable interest, compounding effects). You MUST extract the exact lines, phrases, or clauses.
    - "text": exact clause or sentence from document (NO paraphrasing).
    - "reason": clear consequence of why this is high risk.
5. "warning": An EXHAUSTIVE array of objects for ambiguous, conditional, or moderately risky clauses.
    - "text": exact clause or sentence from document.
    - "reason": why this is a warning.
6. "favorable": An EXHAUSTIVE array of objects for clauses that provide genuine borrower benefit without hidden conditions.
    - "text": exact clause or sentence from document.
    - "reason": why this is favorable.
7. "summary": A structured summary of the document. Use plain HTML tags (<b>, <ul>, <li>, <br/>) for formatting. STRICTLY follow this structure and core instructions:

CORE INSTRUCTIONS FOR SUMMARY:
- Be extremely precise with numbers (DO NOT use vague terms like "high" or "low" without numbers).
- If original text uses Dollars ($), convert these values to Indian Rupee (₹ INR) in the summary based on 1 USD = 83 INR approx.
- Detect and highlight HIGH-RISK elements aggressively (e.g. Penalty APR increases, late fees). Explain the REAL consequence (e.g., "Missing one payment increases interest to 39% APR").
- Identify HIDDEN COSTS (processing, maintenance, documentation).
- Detect MISLEADING or FAVORABLE statements and explain WHY they hide long-term costs.
- Explain COMPOUNDING IMPACT clearly if applicable.
- Make risks impossible to ignore. Sound like a financial expert system, not generic.

SUMMARY FORMAT (MUST USE THIS EXACT HTML STRUCTURE):
<b>Summary:</b><br/>[Clear, powerful paragraph explaining the overall situation and risk]<br/><br/>
<b>Key Details:</b><ul><li>Loan Amount: [value in INR]</li><li>Interest Rate (include promotional + standard): [value]</li><li>Penalty Interest Rate: [value]</li><li>Tenure: [value]</li><li>Monthly Payment: [value in INR]</li></ul><br/>
<b>Hidden Costs:</b><ul><li>[list or "None found"]</li></ul><br/>
<b>Risks:</b><ul><li>[list with clear consequences or "None found"]</li></ul><br/>
<b>Favorable but Misleading Points:</b><ul><li>[Identify promotional traps and explain why or "None found"]</li></ul><br/>
<b>Overall Insight:</b><br/>[Strong concluding statement stating if this is low, moderate, or high risk]

IMPORTANT: Do NOT give financial advice. Do NOT guess missing values. Do NOT hallucinate names or facts not actively presented in the text.
8. "simpleLanguage": An array of objects for complex terms offering plain English translations.
    - "original": the complex legal word
    - "translation": plain English equivalent.
    
Ensure the output is strictly valid JSON without markdown wrapping like \`\`\`json.`
        },
        { 
          role: "user", 
          content: text 
        }
      ],
      model: "openai/gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const choice = response.choices[0].message.content;
    if (!choice) {
      throw new Error("No response from AI model.");
    }
    
    let result = JSON.parse(choice);
    // Ensure breakdown defaults cleanly
    result.scoreBreakdown = result.scoreBreakdown || [];

    // Unify the new risk models back into the legacy flags format expected by UI
    result.flags = [
      ...(result.high_risk || []).map((r: any) => ({ word: r.text, type: "red", explanation: r.reason })),
      ...(result.warning || []).map((r: any) => ({ word: r.text, type: "yellow", explanation: r.reason })),
      ...(result.favorable || []).map((r: any) => ({ word: r.text, type: "green", explanation: r.reason }))
    ];
    // Also pass back the parsed text so the frontend can display the actual PDF content
    result.parsedText = text;

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze document.", details: error.message }, 
      { status: 500 }
    );
  }
}
