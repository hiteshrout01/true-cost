"use client";
import React, { useState, useEffect, DragEvent } from 'react';
import Link from 'next/link';
import MagneticWrapper from '@/components/MagneticWrapper';
import RevealOnScroll from '@/components/RevealOnScroll';
import AnimatedHighlight from '@/components/AnimatedHighlight';
import AIThinkingIndicator from '@/components/AIThinkingIndicator';
import ProgressiveHighlighter from '@/components/ProgressiveHighlighter';
import ScoreCounter from '@/components/ScoreCounter';
import { useReportData } from '@/context/ReportContext';

export default function XRayPage() {
  const { setAnalysis } = useReportData();
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analyzed, setAnalyzed] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [simpleLanguage, setSimpleLanguage] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // Analysis Results
  const [score, setScore] = useState(8.0);
  const [scoreBreakdown, setScoreBreakdown] = useState<{factor:string, impact:number}[]>([]);
  const [riskCategory, setRiskCategory] = useState("Low Risk");
  const [clauses, setClauses] = useState<{text:string, type:string, reason:string, start?: number, end?: number}[]>([]);
  const [metrics, setMetrics] = useState<{interest_rate: string, penalty_apr: string, fees: string[], tenure: string, loan_amount: string}>({
    interest_rate: '--',
    penalty_apr: '--',
    fees: [],
    tenure: '--',
    loan_amount: '--'
  });
  const [documentSummary, setDocumentSummary] = useState<{overview: string, key_points: string[], risk_level: string} | null>(null);
  
  // Token Structure
  type Token = {
    text: string;
    type: "normal" | "highlight";
    clause?: {
      level: "red" | "yellow" | "green" | "gray";
      explanation: string;
    };
  };

  useEffect(() => {
    if (analyzed && !isScanning) {
      setProgress(100);
    } else {
      setProgress(0);
    }
  }, [analyzing, analyzed, isScanning]);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      
      if (file.name.toLowerCase().endsWith('.pdf') || file.type === "application/pdf") {
        setText("PDF File loaded. Ready to analyze...");
        triggerAnalysis("", file);
      } else {
        reader.onload = (ev) => {
           const extractedText = ev.target?.result as string; 
           setText(extractedText);
           triggerAnalysis(extractedText);
        };
        reader.readAsText(file);
      }
    }
  };

  const normalizeText = (t: string) => t.toLowerCase().replace(/[.,;:!?]/g, '').replace(/\s+/g, ' ').trim();

  const splitIntoSentences = (text: string): { text: string; start: number; end: number }[] => {
    if (!text) return [];
    
    // Improved regex to handle common abbreviations and split on . ! ?
    const sentenceRegex = /[^.!?\s][^.!?]*(?:[.!?](?!['" ]?\s*[a-z])[.!?]*['" ]?|\s*)/g;
    const matches = Array.from(text.matchAll(sentenceRegex));
    
    return matches.map(match => ({
      text: match[0],
      start: match.index!,
      end: match.index! + match[0].length
    }));
  };

  const parseDocument = (fullText: string, aiClauses: any[]): Token[] => {
    if (!fullText) return [];
    
    // 1. Process Sentences
    const sentences = splitIntoSentences(fullText);
    const filteredClauses = (aiClauses || []).filter(c => c.type !== 'neutral');

    if (filteredClauses.length === 0) return [{ text: fullText, type: "normal" }];

    // 2. Map Clauses to Sentences
    const highlightedSentences = new Set<number>();
    const sentenceMappings = new Map<number, any>();

    filteredClauses.forEach(clause => {
      const normalizedClause = normalizeText(clause.text);
      if (!normalizedClause) return;

      let bestMatchIdx = -1;
      let highestSimilarity = 0;

      sentences.forEach((s, idx) => {
        const normalizedSentence = normalizeText(s.text);
        if (!normalizedSentence) return;

        // Requirement 3: Use first 30-50 characters for flexible matching
        const clauseStart = normalizedClause.substring(0, 50);
        
        // Check if the sentence starts with or contains the clause core
        if (normalizedSentence.includes(clauseStart) || normalizedClause.includes(normalizedSentence.substring(0, 50))) {
          // Calculate a simple similarity score based on shared content
          const similarity = normalizedSentence.length > 0 ? (Math.min(normalizedClause.length, normalizedSentence.length) / Math.max(normalizedClause.length, normalizedSentence.length)) : 0;
          
          if (similarity > highestSimilarity) {
            highestSimilarity = similarity;
            bestMatchIdx = idx;
          }
        }
      });

      // Requirement 6: fallback to fuzzy match if mapping fails
      if (bestMatchIdx === -1) {
         // Fallback: Check if substantial keywords overlap
         const clauseKeywords = normalizedClause.split(' ').filter(k => k.length > 4);
         sentences.forEach((s, idx) => {
           const normalizedSentence = normalizeText(s.text);
           if (clauseKeywords.some(k => normalizedSentence.includes(k)) && clauseKeywords.length > 0) {
              bestMatchIdx = idx;
           }
         });
      }

      if (bestMatchIdx !== -1) {
        highlightedSentences.add(bestMatchIdx);
        // Prioritize higher risks if multiple clauses match the same sentence
        const existing = sentenceMappings.get(bestMatchIdx);
        if (!existing || (clause.type === 'high_risk' && existing.type !== 'high_risk')) {
          sentenceMappings.set(bestMatchIdx, clause);
        }
      }
    });

    // 3. Convert Sentences to Tokens
    const tokens: Token[] = [];
    let lastSentenceEnd = 0;

    sentences.forEach((s, idx) => {
      // Add interstitial text (though splitIntoSentences should cover it)
      if (s.start > lastSentenceEnd) {
        tokens.push({ text: fullText.substring(lastSentenceEnd, s.start), type: "normal" });
      }

      const match = sentenceMappings.get(idx);
      if (match) {
        const typeMap: Record<string, "red" | "yellow" | "green" | "gray"> = {
          'high_risk': 'red',
          'warning': 'yellow',
          'favorable': 'green'
        };

        tokens.push({
          text: s.text,
          type: "highlight",
          clause: { level: typeMap[match.type] || 'gray', explanation: match.reason }
        });
      } else {
        tokens.push({ text: s.text, type: "normal" });
      }
      lastSentenceEnd = s.end;
    });

    // Add trailing text
    if (lastSentenceEnd < fullText.length) {
      tokens.push({ text: fullText.substring(lastSentenceEnd), type: "normal" });
    }

    return tokens;
  };

  const generateHighlightedText = () => {
    if (!analyzed) return <p className="text-on-surface-variant italic">Waiting for document analysis...</p>;
    if (errorMsg) return <div className="leading-relaxed whitespace-pre-wrap interactive-document font-sans text-on-surface/90">{text}</div>;

    let summaryBlock = null;
    if (simpleLanguage && documentSummary) {
      summaryBlock = (
        <div className="mb-8 p-6 bg-secondary/5 rounded-2xl border border-secondary/10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-secondary flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">analytics</span>
              Precision Financial Summary
            </h3>
            <div className="px-3 py-1 rounded-full bg-secondary/10 text-[10px] font-bold text-secondary uppercase tracking-[0.1em] border border-secondary/20">
              Verified Analysis
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <p className="text-on-surface/90 text-sm leading-relaxed italic">"{documentSummary.overview}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Facts Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-tertiary">
                  <span className="material-symbols-outlined text-sm">fact_check</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Key Facts</span>
                </div>
                <ul className="space-y-2">
                  {(documentSummary.key_facts || []).map((fact: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm text-on-surface/80 group">
                      <span className="text-tertiary mt-1 text-[10px] opacity-50 group-hover:opacity-100 transition-opacity">●</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Risks Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-error">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Key Risks</span>
                </div>
                <ul className="space-y-2">
                  {(documentSummary.key_risks || []).map((risk: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm text-on-surface/80 group">
                      <span className="text-error mt-1 text-[10px] opacity-50 group-hover:opacity-100 transition-opacity">●</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const tokens = parseDocument(text, clauses);

    return (
      <div>
        {summaryBlock}
        <h3 className="text-lg font-bold text-on-surface/70 flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-sm">article</span>
            Full Dissected Document
        </h3>
        {clauses.filter(c => c.type !== "neutral").length === 0 && (
           <div className="mb-6 p-4 rounded-xl bg-tertiary/5 border border-tertiary/20 flex gap-3 items-center">
              <span className="material-symbols-outlined text-tertiary">check_circle</span>
              <p className="text-sm text-tertiary/90 font-medium">✓ No significant risks or notable clauses detected in this section</p>
           </div>
        )}
        <ProgressiveHighlighter 
          isScanning={isScanning} 
          onComplete={() => setIsScanning(false)}
        >
          <div className="leading-relaxed whitespace-pre-wrap interactive-document font-sans text-on-surface/90">
             {tokens.map((token, i) => {
                 if (token.type === "highlight") {
                     let colorClasses = "";
                     let icon = "verified";
                     let iconColor = "text-tertiary";
                     let title = "Favorable";

                     if (token.clause?.level === "red") {
                         colorClasses = "highlight-red bg-error/10 border-l-[3px] border-error text-error drop-shadow-[0_0_8px_rgba(255,84,73,0.25)]";
                         icon = "dangerous";
                         iconColor = "text-error";
                         title = "High Risk";
                     } else if (token.clause?.level === "yellow") {
                         colorClasses = "highlight-yellow bg-[#facc15]/15 border-l-[3px] border-[#facc15] text-[#facc15]";
                         icon = "warning";
                         iconColor = "text-[#facc15]";
                         title = "Warning";
                     } else if (token.clause?.level === "green") {
                         colorClasses = "highlight-green bg-tertiary/15 border-l-[3px] border-tertiary text-tertiary";
                     } else if (token.clause?.level === "gray") {
                         colorClasses = "highlight-neutral opacity-60"; // Requirement 7: no high-visibility highlight
                         icon = "info";
                         iconColor = "text-outline";
                         title = "Neutral";
                     }

                     return (
                         <div className={`relative group inline cursor-help px-1 rounded-sm transition-all ${colorClasses}`} key={i}>
                             <span className="highlight inline">{token.text}</span>
                             <div className="tooltip opacity-0 group-hover:opacity-100 absolute top-full left-1/2 -translate-x-1/2 pointer-events-none z-[100] mt-1 w-max max-w-[280px] bg-[#1a1a24] border border-outline-variant/30 rounded-xl shadow-2xl p-4 transition-all duration-300">
                                 <div className="flex items-center gap-2 mb-2">
                                     <span className={`material-symbols-outlined text-sm ${iconColor}`}>{icon}</span>
                                     <span className={`text-xs font-bold uppercase tracking-wider ${iconColor}`}>{title}</span>
                                 </div>
                                 <p className="text-sm text-on-surface-variant leading-snug font-normal text-left whitespace-normal">{token.clause?.explanation}</p>
                                 <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-outline">Verified AI Insight</div>
                             </div>
                         </div>
                     );
                 }
                 return <span key={i}>{token.text}</span>;
             })}
          </div>
        </ProgressiveHighlighter>
      </div>
    );
  };

  const triggerAnalysis = async (content: string, pdfFile?: File) => {
    const isPlaceholder = content === "PDF File loaded. Ready to analyze...";
    if (!pdfFile && (!content.trim() || isPlaceholder)) return;

    setAnalyzing(true);
    setAnalyzed(false);
    setErrorMsg("");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second safety timeout

    try {
      const formData = new FormData();
      if (pdfFile) formData.append("pdf", pdfFile);
      else formData.append("text", content);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Analysis failed.");

      setScore(data.score ?? 5.0);
      setClauses(data.clauses ?? []);
      setMetrics(data.metrics ?? { interest_rate: '--', penalty_apr: '--', fees: [], tenure: '--', loan_amount: '--' });
      setDocumentSummary(data.summary ?? null);
      
      const parsedContent = data.parsedText || content;
      setText(parsedContent);
      
      setAnalysis({
        summary: data.summary,
        clauses: data.clauses,
        metrics: data.metrics,
        score: data.score,
        parsedText: parsedContent
      });
      
      setAnalyzed(true);
      setIsScanning(true);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error(err);
      if (err.name === 'AbortError') {
        setErrorMsg("Analysis timed out. The server took too long to respond. Please try with a smaller text chunk.");
      } else {
        setErrorMsg(err.message || "Failed to analyze document.");
      }
      setAnalyzed(false); // Don't show results grid if we failed
    } finally {
      setAnalyzing(false);
    }
  };

  const ringColor = score < 5 ? '#ffb4ab' : score < 8 ? '#facc15' : '#4edea3';
  const ringOffset = 364 - (364 * (score / 10));

  return (
    <main className="pt-[100px] pb-20 px-6 max-w-7xl mx-auto space-y-12">
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-headline font-bold tracking-tight text-on-surface">Financial X-Ray</h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto">Upload or paste your loan agreement. Our AI will dissect the fine print to reveal the FinSight and hidden risks.</p>
        </div>

        {/* TRUST & PRIVACY */}
        <RevealOnScroll className="flex flex-wrap justify-center gap-4 mb-8">
          {[
            {icon: 'delete_sweep', color: 'text-primary', text: 'Auto-deleted after analysis'},
            {icon: 'shield_lock', color: 'text-secondary', text: 'Zero data sharing'},
            {icon: 'verified_user', color: 'text-blue-400', text: 'Encrypted processing'},
            {icon: 'cloud_done', color: 'text-primary-container', text: 'Locally analyzed metadata'}
          ].map((t, idx) => (
            <div key={idx} className="glass-panel w-[200px] h-[120px] rounded-xl p-4 flex flex-col justify-center items-center text-center gap-2">
              <span className={`material-symbols-outlined ${t.color} text-3xl`}>{t.icon}</span>
              <p className="text-xs font-headline font-bold">{t.text}</p>
            </div>
          ))}
        </RevealOnScroll>

        {errorMsg && (
          <RevealOnScroll className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex gap-3 items-center">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-sm text-error font-medium">{errorMsg}</p>
          </RevealOnScroll>
        )}

        {/* UPLOAD BOX */}
        <div className="bg-[#131318] p-[1px] shadow-2xl rounded-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-tertiary rounded-2xl -z-10 -m-[2px]"></div>
          <div 
            className={`glass-panel rounded-2xl p-6 relative overflow-hidden border-2 border-dashed ${isDragActive ? 'border-primary bg-primary/5' : 'border-secondary/30'} transition-all min-h-[250px] flex flex-col`}
            onDragOver={(e) => {e.preventDefault(); setIsDragActive(true)}}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={handleDrop}
          >
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50 resize-none font-body text-lg outline-none" 
              placeholder="Paste your loan agreement text here or drop a PDF..."
            />
            {analyzing && (
              <div className="mt-4 pointer-events-none scale-95 origin-center">
                 <AIThinkingIndicator />
              </div>
            )}
            <div className="flex justify-between items-center mt-6">
               <div className="flex items-center gap-4">
                 <input 
                   type="file" 
                   accept=".txt,.pdf"
                   id="file-upload" 
                   className="hidden" 
                   onChange={(e) => {
                     const file = e.target.files?.[0];
                     if (file) {
                       const reader = new FileReader();
                       if (file.name.toLowerCase().endsWith('.pdf') || file.type === "application/pdf") {
                          setText("PDF File loaded. Ready to analyze...");
                          triggerAnalysis("", file);
                       } else {
                          reader.onload = (ev) => {
                             const extractedText = ev.target?.result as string;
                             setText(extractedText);
                             triggerAnalysis(extractedText);
                          };
                          reader.readAsText(file);
                       }
                     }
                   }}
                 />
                 <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-secondary transition-colors border border-white/10">
                   <span className="material-symbols-outlined text-lg">upload_file</span>
                   Upload Document
                 </label>
                 <span className="text-xs text-outline hidden md:block">{text.length > 0 ? `${text.length} characters` : ''}</span>
               </div>
               <MagneticWrapper>
                 <button onClick={() => triggerAnalysis(text)} disabled={analyzing || text.length === 0} className="group relative px-6 md:px-8 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-headline font-bold text-on-primary-container overflow-hidden active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                   <span className="relative z-10 flex items-center gap-2">
                     <span className="material-symbols-outlined">auto_awesome</span>
                     {analyzing ? 'Scanning text...' : 'Analyze Now'}
                   </span>
                   <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                 </button>
               </MagneticWrapper>
            </div>
          </div>
        </div>
      </section>

      {/* Results Grid */}
      {analyzed && (
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start animate-in fade-in slide-in-from-bottom-8 duration-500">
          {/* Left: Annotated Text / Summary */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="font-headline text-xl font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">description</span>
                Agreement Analysis
              </h2>
              {!simpleLanguage && (
                 <div className="flex gap-4 text-xs font-label">
                   <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-error"></div> High Risk</span>
                   <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#facc15]"></div> Warning</span>
                   <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-tertiary"></div> Favorable</span>
                 </div>
              )}
            </div>
            
            <div className="glass-panel rounded-2xl p-8 text-on-surface/90 font-body border-outline-variant/20 min-h-[400px]">
              {generateHighlightedText()}
            </div>


          </div>

          {/* Right: Insights Sidebar */}
          <aside className="space-y-6 sticky top-[90px]">
             {/* Transparency Score */}
             <RevealOnScroll className="glass-panel rounded-2xl p-6 text-center space-y-4">
                <h3 className="font-headline text-sm font-medium text-outline uppercase tracking-widest">Transparency Score</h3>
                <ScoreCounter finalScore={score} ringColor={ringColor} riskCategory={documentSummary?.risk_level || "Analyzing..."} />
                
                {/* Score Breakdown Widget - Minimal implementation since AI returns score directly now */}
                <div className="mt-4 border-t border-white/5 pt-4 text-left">
                  <h4 className="text-xs font-semibold text-outline-variant mb-2">Primary Risk Factors</h4>
                  <div className="space-y-4">
                     <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-[10px] text-outline uppercase font-bold mb-1">Penalty APR</p>
                        <p className="text-sm font-bold text-error">{metrics.penalty_apr}</p>
                     </div>
                     <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-[10px] text-outline uppercase font-bold mb-1">Detected Fees</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                           {metrics.fees.length > 0 ? metrics.fees.map((f, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">{f}</span>
                           )) : <span className="text-xs text-on-surface-variant">No explicit fees found</span>}
                        </div>
                     </div>
                  </div>
                </div>
             </RevealOnScroll>

             {/* Simple Language Toggle */}
             <RevealOnScroll className="glass-panel rounded-2xl p-5 flex flex-col gap-3">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-sm">translate</span>
                    </div>
                    <p className="font-headline font-bold text-[15px]">Explain in Simple Language</p>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer scale-90">
                   <input type="checkbox" className="sr-only peer" checked={simpleLanguage} onChange={e=>setSimpleLanguage(e.target.checked)} />
                   <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                 </label>
               </div>
               <p className="text-xs text-on-surface-variant leading-relaxed">Translate legalese into a plain English summary for better understanding.</p>
             </RevealOnScroll>

             {/* Key Terms */}
             <RevealOnScroll className="space-y-3">
                <MagneticWrapper className="w-full">
                  <div className="glass-panel rounded-xl overflow-hidden border-l-4 border-tertiary bg-surface-container/50 text-left">
                    <div className="w-full p-4 flex flex-col items-start gap-2">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-tertiary">key_visualizer</span>
                            <span className="text-sm font-headline font-semibold flex-1">Key Terms Breakdown</span>
                        </div>
                        <div className="w-full flex justify-between text-xs p-2 bg-black/20 rounded">
                            <span className="text-on-surface-variant font-label">Interest Rate</span>
                            <span className="text-tertiary font-bold">{metrics.interest_rate}</span>
                        </div>
                        <div className="w-full flex justify-between text-xs p-2 bg-black/20 rounded">
                            <span className="text-on-surface-variant font-label">Penalty APR</span>
                            <span className="text-error font-bold">{metrics.penalty_apr}</span>
                        </div>
                        <div className="w-full flex justify-between text-xs p-2 bg-black/20 rounded">
                            <span className="text-on-surface-variant font-label">Loan Amount</span>
                            <span className="text-tertiary font-bold">{metrics.loan_amount}</span>
                        </div>
                        <div className="w-full flex justify-between text-xs p-2 bg-black/20 rounded">
                            <span className="text-on-surface-variant font-label">Total Fees</span>
                            <span className="text-secondary font-bold">{Array.isArray(metrics.fees) ? metrics.fees.join(', ') : metrics.fees}</span>
                        </div>
                        <div className="w-full flex justify-between text-xs p-2 bg-black/20 rounded">
                            <span className="text-on-surface-variant font-label">Tenure</span>
                            <span className="text-tertiary font-bold">{metrics.tenure}</span>
                        </div>
                    </div>
                  </div>
                </MagneticWrapper>
                
                <MagneticWrapper>
                   <button className="w-full mt-4 flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-secondary" onClick={() => window.location.href = '/'}>
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-xl">logout</span>
                        <span className="text-sm font-medium">Exit Analysis</span>
                      </div>
                    </button>
                </MagneticWrapper>
              </RevealOnScroll>
          </aside>
        </section>
      )}
      
      {/* Global AI Tooltip Removed - Embedded Directly via AST Map */}
    </main>
  );
}
