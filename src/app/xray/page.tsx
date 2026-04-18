"use client";
import React, { useState, useEffect, DragEvent } from 'react';
import Link from 'next/link';
import MagneticWrapper from '@/components/MagneticWrapper';
import RevealOnScroll from '@/components/RevealOnScroll';
import AnimatedHighlight from '@/components/AnimatedHighlight';
import AIThinkingIndicator from '@/components/AIThinkingIndicator';
import ProgressiveHighlighter from '@/components/ProgressiveHighlighter';
import ScoreCounter from '@/components/ScoreCounter';

export default function XRayPage() {
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
  const [flags, setFlags] = useState<{word:string, type:string, explanation:string}[]>([]);
  const [insights, setInsights] = useState<{apr: string, tenure: string, principal: string}>({apr: '--', tenure: '--', principal: '--'});
  const [translations, setTranslations] = useState<{original:string, translation:string}[]>([]);
  const [documentSummary, setDocumentSummary] = useState("");
  
  // Tooltip State
  const [tooltip, setTooltip] = useState<{visible: boolean, x: number, y: number, type: string, explanation: string}>({visible: false, x: 0, y: 0, type: '', explanation: ''});

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
        // Do not read text dynamically for PDF, our PDF parse will handle it in backend.
        // We can just trigger analysis directly
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

  const generateHighlightedText = () => {
    if (!analyzed) return <p className="text-on-surface-variant italic">Waiting for document analysis...</p>;
    if (errorMsg) return <p className="text-error">{errorMsg}</p>;
    // Render Both Summary and Document Text when simpleLanguage is active
    let summaryBlock = null;
    if (simpleLanguage && documentSummary) {
      summaryBlock = (
        <div className="mb-8 p-6 bg-secondary/10 rounded-xl border border-secondary/20">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined">psychology</span>
            AI Plain English Summary
          </h3>
          <div 
            className="leading-relaxed text-on-surface/90 text-[15px] summary-content space-y-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>b]:text-primary"
            dangerouslySetInnerHTML={{ __html: documentSummary }} 
          />
        </div>
      );
    }

    let highlightedText = text;

    // Apply flags logic
    if (flags && flags.length > 0) {
      // 1. Deduplicate Highlight Array to prevent overlapping same tags
      const uniqueFlagsMap = new Map();
      flags.forEach(flag => {
         if (!uniqueFlagsMap.has(flag.word)) {
             uniqueFlagsMap.set(flag.word, flag);
         }
      });
      let uniqueFlags = Array.from(uniqueFlagsMap.values());
      
      // 2. Sort by Severity (Red -> Yellow -> Green)
      const priority: Record<string, number> = { "red": 0, "yellow": 1, "green": 2 };
      uniqueFlags.sort((a, b) => priority[a.type] - priority[b.type]);

      uniqueFlags.forEach(flag => {
        let colorClasses = "";
        if (flag.type === "red") {
          colorClasses = "highlight-red bg-error/10 border-l-[3px] border-error text-error drop-shadow-[0_0_8px_rgba(255,84,73,0.25)] animate-pulse-red";
        } else if (flag.type === "yellow") {
          colorClasses = "highlight-yellow bg-[#facc15]/15 border-l-[3px] border-[#facc15] text-[#facc15] animate-shimmer-yellow";
        } else if (flag.type === "green") {
          colorClasses = "highlight-green bg-tertiary/15 border-l-[3px] border-tertiary text-tertiary animate-pulse-green";
        }

        if (!flag.word) return;
        
        let safeWord = flag.word.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Flexible whitespace and quote matching for messy PDF formats
        safeWord = safeWord.replace(/[\s\n\r]+/g, '[\\s\\n\\r]+').replace(/['"]/g, '[\'"‘’“”]');
        
        const prefix = /^[\w]/.test(flag.word) ? '\\b' : '';
        const suffix = /[\w]$/.test(flag.word) ? '\\b' : '';
        let regex = new RegExp(`${prefix}(${safeWord})${suffix}`, 'gi');
        
        let safeReason = flag.explanation.replace(/"/g, '&quot;');
        
        // Custom Replacer to PREVENT NESTED OVERLAPPING TAGS (Safe Override)
        const safeReplacer = (match: string, p1?: any, offset?: number, string?: string) => {
            // Based on string replace signature, offset can be 2nd or 3rd arg depending on groups
            const trueOffset = typeof p1 === 'number' ? p1 : (typeof offset === 'number' ? offset : 0);
            const strContext = typeof p1 === 'number' ? offset : string; // string is the last arg generally
            
            const upToMatch = (strContext as unknown as string).substring(0, trueOffset);
            const openSpans = (upToMatch.match(/<span/g) || []).length;
            const closeSpans = (upToMatch.match(/<\/span>/g) || []).length;
            if (openSpans > closeSpans) return match; // Already claimed by higher priority tag!
            
            // Apply the tag! Note parameter matching differences, wrap specifically the match (which could be group $1)
            let matchText = match;
            return `<span class="${colorClasses} cursor-help px-1 rounded-r-sm font-semibold flag-highlight" data-type="${flag.type}" data-reason="${safeReason}">${matchText}</span>`;
        };
        
        if (regex.test(highlightedText)) {
            // Apply exact match
            regex = new RegExp(`${prefix}(${safeWord})${suffix}`, 'gi');
            highlightedText = highlightedText.replace(regex, safeReplacer);
        } else {
            // FALLBACK MATCHING: Extract highly relevant financial keywords/numbers if exact string doesn't match
            const keywordPattern = /\b(\d+%|39% APR|processing fee|maintenance fee|late fee|penalty|₹?\d+(?:\.\d+)?|variable interest|compounding)\b/gi;
            const keywordsObj = flag.word.match(keywordPattern);
            
            if (keywordsObj && keywordsObj.length > 0) {
                 keywordsObj.forEach(kw => {
                     const safeKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                     const kwRegex = new RegExp(`\\b(${safeKw})\\b`, 'gi');
                     highlightedText = highlightedText.replace(kwRegex, safeReplacer);
                 });
            } else {
                 // EXTREME FALLBACK: Use chunk matching (first 30 characters of the flag word)
                 const snippet = flag.word.length > 30 ? flag.word.substring(0, 30) : flag.word;
                 const safeSnippet = snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[\s\n\r]+/g, '[\\s\\n\\r]+');
                 const snipRegex = new RegExp(`(${safeSnippet})`, 'gi');
                 highlightedText = highlightedText.replace(snipRegex, safeReplacer);
            }
        }
      });
      
      // EXTRA EXHAUSTIVE FALLBACK: Tag remaining high-risk words that weren't captured into Warning state
      const globalRisks = ["penalty", "interest", "APR", "fee", "default", "liability", "charge", "late"];
      globalRisks.forEach(kw => {
         const kwRegex = new RegExp(`\\b(${kw})\\b`, 'gi');
         highlightedText = highlightedText.replace(kwRegex, (match, p1, offset, string) => {
            // Only replace if it's not already inside our highlight <span>
            const upToMatch = string.substring(0, offset);
            const openSpans = (upToMatch.match(/<span/g) || []).length;
            const closeSpans = (upToMatch.match(/<\/span>/g) || []).length;
            if (openSpans > closeSpans) return match; // Inside a tag!
            
            return `<span class="highlight-yellow bg-[#facc15]/15 border-l-[3px] border-[#facc15] text-[#facc15] cursor-help px-1 rounded-r-sm font-semibold flag-highlight" data-type="yellow" data-reason="System identified high-risk terminology requiring caution.">${match}</span>`;
         });
      });
    }
    // Pattern Insights Engine
    let patternInsight = null;
    if (flags && flags.length > 0) {
        const allReasons = flags.map(f => f.explanation.toLowerCase()).join(" ");
        const hasPenalty = (allReasons.match(/penalty/g) || []).length >= 2;
        const hasLiability = (allReasons.match(/liability/g) || []).length >= 2;
        const hasDefault = (allReasons.match(/default/g) || []).length >= 2;
        
        let insightText = "";
        if (hasPenalty && hasLiability) {
            insightText = "Multiple clauses emphasize penalties and strict liability.";
        } else if (hasPenalty) {
            insightText = "Multiple clauses emphasize punitive financial penalties.";
        } else if (hasLiability) {
            insightText = "Significant repetition of strict borrower liability clauses detected.";
        } else if (hasDefault) {
            insightText = "Multiple clauses define immediate default conditions.";
        }
        
        if (insightText) {
            patternInsight = (
               <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex gap-3 items-center">
                  <span className="material-symbols-outlined text-error">warning</span>
                  <div>
                     <h4 className="text-sm font-bold text-error uppercase tracking-wider">Pattern Detected</h4>
                     <p className="text-sm text-error/90">{insightText}</p>
                  </div>
               </div>
            );
        }
    }

    // Apply Simple Language logic
    if (simpleLanguage && translations && translations.length > 0) {
      translations.forEach(trans => {
        if (!trans.original) return;
        const safeWord = trans.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const prefix = /^[\w]/.test(trans.original) ? '\\b' : '';
        const suffix = /[\w]$/.test(trans.original) ? '\\b' : '';
        const regex = new RegExp(`${prefix}(${safeWord})${suffix}`, 'gi');
        highlightedText = highlightedText.replace(regex, `<strong>${trans.translation}</strong>`);
      });
    }

    // FINAL OUTPUT GENERATION (No structural modifications)
    // Keep document 100% exactly as provided, preserving original order.
    // Convert newlines to HTML breaks natively.
    let collapsedHTML = highlightedText.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');

    return (
      <div>
        {patternInsight}
        {summaryBlock}
        <h3 className="text-lg font-bold text-on-surface/70 flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-sm">article</span>
            Full Dissected Document
        </h3>
        <ProgressiveHighlighter 
          isScanning={isScanning} 
          onComplete={() => setIsScanning(false)}
        >
          <div 
            onMouseMove={(e) => {
               const target = e.target as HTMLElement;
               const highlighter = target.closest('.flag-highlight') as HTMLElement;
               const isRevealed = highlighter && getComputedStyle(highlighter).opacity === '1';
               if (highlighter && isRevealed) {
                  setTooltip({
                     visible: true,
                     x: e.clientX,
                     y: e.clientY,
                     type: highlighter.getAttribute('data-type') || 'yellow',
                     explanation: highlighter.getAttribute('data-reason') || ''
                  });
               } else {
                  setTooltip(prev => ({...prev, visible: false}));
               }
            }}
            onMouseLeave={() => setTooltip(prev => ({...prev, visible: false}))}
            dangerouslySetInnerHTML={{ __html: collapsedHTML }} 
            className="leading-relaxed whitespace-pre-wrap interactive-document" 
          />
        </ProgressiveHighlighter>
      </div>
    );
  };

  const triggerAnalysis = async (content: string, pdfFile?: File) => {
    if (!content.trim() && !pdfFile) return;
    setAnalyzing(true);
    setAnalyzed(false);
    setErrorMsg("");
    setSimpleLanguage(false); // reset toggle

    try {
      const formData = new FormData();
      if (pdfFile) {
        formData.append("pdf", pdfFile);
      } else {
        formData.append("text", content);
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setScore(data.score ?? 8.0);
      setScoreBreakdown(data.scoreBreakdown ?? []);
      setRiskCategory(data.riskCategory ?? "Low Risk");
      setFlags(data.flags ?? []);
      setInsights({
         apr: data.insights?.apr ?? '--',
         tenure: data.insights?.tenure ?? '--',
         principal: data.insights?.principal ?? '--'
      });
      setTranslations(data.simpleLanguage ?? []);
      setDocumentSummary(data.summary ?? "");
      
      if (data.parsedText) {
          setText(data.parsedText);
      }
      
      setAnalyzed(true);
      setIsScanning(true); // Initiate the scan sweep
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to analyze document.");
      setAnalyzed(true);
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
                <ScoreCounter finalScore={score} ringColor={ringColor} riskCategory={riskCategory} />
                
                {/* Score Breakdown Widget */}
                {scoreBreakdown && scoreBreakdown.length > 0 && (
                  <div className="mt-4 border-t border-white/5 pt-4 text-left">
                    <h4 className="text-xs font-semibold text-outline-variant mb-2">Score Breakdown</h4>
                    <div className="space-y-2">
                       {scoreBreakdown.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs animate-in slide-in-from-right-4 fade-in duration-500 fill-mode-both" style={{animationDelay: `${idx * 150}ms`}}>
                             <span className="text-on-surface-variant truncate pr-2" title={item.factor}>{item.factor}</span>
                             <span className={`font-bold ${item.impact < 0 ? 'text-error' : item.impact > 0 ? 'text-tertiary' : 'text-on-surface'}`}>
                               {item.impact > 0 ? '+' : ''}{item.impact}
                             </span>
                          </div>
                       ))}
                    </div>
                  </div>
                )}
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

             {/* Pattern Insights */}
             {score <= 7 && (
                <div className="space-y-4">
                    <h3 className="font-headline text-sm font-semibold flex items-center gap-2 px-2">
                        <span className="material-symbols-outlined text-yellow-400">lightbulb</span> Pattern Insights
                    </h3>
                    <div className="space-y-2">
                        <div className="glass-panel rounded-xl p-3 border-l-4 border-error/50">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-headline font-bold">Watch Out</span>
                                <span className="material-symbols-outlined text-sm text-error">warning</span>
                            </div>
                            <p className="text-[10px] text-on-surface-variant mb-1">Our AI identified punitive clauses or vague terms that could result in unexpected costs.</p>
                        </div>
                    </div>
                </div>
             )}

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
                            <span className="text-on-surface-variant font-label">APR</span>
                            <span className="text-tertiary font-bold">{insights.apr}</span>
                        </div>
                        <div className="w-full flex justify-between text-xs p-2 bg-black/20 rounded">
                            <span className="text-on-surface-variant font-label">Principal</span>
                            <span className="text-tertiary font-bold">{insights.principal}</span>
                        </div>
                        <div className="w-full flex justify-between text-xs p-2 bg-black/20 rounded">
                            <span className="text-on-surface-variant font-label">Tenure</span>
                            <span className="text-tertiary font-bold">{insights.tenure}</span>
                        </div>
                    </div>
                  </div>
                </MagneticWrapper>
             </RevealOnScroll>
          </aside>
        </section>
      )}
      
      {/* Global AI Tooltip */}
      {tooltip.visible && (
        <div 
           className="fixed pointer-events-none z-[100] max-w-[280px] bg-[#1a1a24] border border-outline-variant/30 rounded-xl shadow-2xl p-4 transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2 zoom-in-95 delay-100"
           style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}
        >
           <div className="flex items-center gap-2 mb-2">
             <span className={`material-symbols-outlined text-sm ${tooltip.type === 'red' ? 'text-error' : tooltip.type === 'yellow' ? 'text-[#facc15]' : 'text-tertiary'}`}>
               {tooltip.type === 'red' ? 'dangerous' : tooltip.type === 'yellow' ? 'warning' : 'verified'}
             </span>
             <span className={`text-xs font-bold uppercase tracking-wider ${tooltip.type === 'red' ? 'text-error' : tooltip.type === 'yellow' ? 'text-[#facc15]' : 'text-tertiary'}`}>
               {tooltip.type === 'red' ? 'High Risk' : tooltip.type === 'yellow' ? 'Warning' : 'Favorable'}
             </span>
           </div>
           <p className="text-sm text-on-surface-variant leading-snug">
             {tooltip.explanation}
           </p>
           <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-outline">
              <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
              AI Flagger
           </div>
        </div>
      )}
    </main>
  );
}
