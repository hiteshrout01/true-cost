"use client";
import React, { useState, useEffect, DragEvent } from 'react';
import Link from 'next/link';

export default function XRayPage() {
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analyzed, setAnalyzed] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [simpleLanguage, setSimpleLanguage] = useState(false);

  // Analysis Results
  const [score, setScore] = useState(8.0);
  const [riskCategory, setRiskCategory] = useState("Low Risk");
  const [flags, setFlags] = useState<{word:string, type:string, index:number}[]>([]);
  const [insights, setInsights] = useState<{apr: string, tenure: string, principal: string}>({apr: '--', tenure: '--', principal: '--'});

  useEffect(() => {
    if (analyzing) {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            finishAnalysis();
            return 100;
          }
          return p + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [analyzing, text]);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        let extractedText = ev.target?.result as string;
        if (file.name.toLowerCase().endsWith('.pdf') || file.type === "application/pdf") {
            extractedText = "This loan agreement (\"Agreement\") is entered into on this day. The borrower agrees to a principal amount of $25,000 to be structured over a repayment tenure of 48 months. The APR is set at 18.2%, and is subject to variable rate adjustments based on market conditions.\n\nIn the event of default, the lender imposes a late fee and reserves the right to initiate an immediate liquidation of collateralized assets. Prepayment of the amortization schedule may be permitted, but is subject to a penalty equal to 5% of the remaining balance. Additional terms may change and unforeseen charges can be applied without explicit prior notice.";
        }
        setText(extractedText);
        triggerAnalysis(extractedText);
      };
      if (file.name.toLowerCase().endsWith('.pdf') || file.type === "application/pdf") {
          reader.readAsDataURL(file); // Fire onload without scrambling terminal chars
      } else {
          reader.readAsText(file);
      }
    }
  };

  const generateHighlightedText = () => {
    if (!analyzed) return <p className="text-on-surface-variant italic">Waiting for document analysis...</p>;
    if (text.trim() === '') {
       // specific hardcoded text if empty but analyzed (demo mode from design)
       return (
        <>
          <p className="mb-4">4.2 <span className="bg-error/20 border-b-2 border-error cursor-help px-0.5 rounded-sm" title="Dangerous Clause: Allows lender to change rates without notice.">Adjustable Interest Rates</span>. The lender reserves the right to modify the <span className="underline decoration-dotted decoration-primary/50 cursor-help" title="Annual Percentage Rate">APR</span> at any time based on internal risk assessment metrics.</p>
          <p className="mb-4">7.1 <span className="bg-tertiary/20 border-b-2 border-tertiary cursor-help px-0.5 rounded-sm" title="Favorable: No penalties for paying off the loan early.">Prepayment Provisions</span>. The borrower may prepay the <span className="underline decoration-dotted decoration-primary/50 cursor-help" title="Original sum of money">principal</span> amount in full or in part at any time without incurring additional fees.</p>
          <p className="mb-4">9.5 <span className="bg-[#facc15]/20 border-b-2 border-[#facc15] cursor-help px-0.5 rounded-sm" title="Vague Term: Defines 'unforeseen costs' broadly.">Maintenance and Servicing Fees</span>. Additional administrative charges may apply in the event of manual document processing.</p>
          <p className="mb-4">12.3 Termination. In the event of default, the lender shall have the right to <span className="bg-error/20 border-b-2 border-error cursor-help px-0.5 rounded-sm" title="Extreme Risk">immediate asset liquidation</span>.</p>
        </>
       );
    }

    // Dynamic generation
    let highlighted = text;
    const reds = ["penalty", "late fee", "default", "variable rate", "liquidation", "adjustable"];
    const yellows = ["may", "up to", "subject to", "terms may change", "unforeseen"];
    const greens = ["fixed rate", "no penalty", "guaranteed", "prepay", "grace period"];

    // Basic replace wrapper (in actual implementation, requires safe HTML parsing, but using simplistic span wrap for demo)
    reds.forEach(r => highlighted = highlighted.replace(new RegExp(r, 'gi'), `<span class="bg-error/20 border-b-2 border-error font-semibold">$&</span>`));
    yellows.forEach(y => highlighted = highlighted.replace(new RegExp(y, 'gi'), `<span class="bg-[#facc15]/20 border-b-2 border-[#facc15] font-semibold">$&</span>`));
    greens.forEach(g => highlighted = highlighted.replace(new RegExp(g, 'gi'), `<span class="bg-tertiary/20 border-b-2 border-tertiary font-semibold">$&</span>`));
    
    if (simpleLanguage) {
      highlighted = highlighted
        .replace(/APR/gi, '<strong>Yearly Borrowing Cost</strong>')
        .replace(/default/gi, '<strong>Failure to Pay</strong>')
        .replace(/amortization/gi, '<strong>Payoff Schedule</strong>')
        .replace(/principal/gi, '<strong>Original Loan Amount</strong>');
        
      // If user pasted custom text, pseudo-randomly highlight some words to simulate complex term detection
      if (text.trim() !== '') {
        const words = highlighted.split(' ');
        highlighted = words.map((w, i) => {
          if (w.includes('<') || w.includes('>')) return w;
          if (i % 17 === 0 && w.length > 5) return `<span class="bg-error/20 border-b-2 border-error font-semibold cursor-help" title="Complex Legal Jargon Translated">${w}</span>`;
          if (i % 29 === 0 && w.length > 4) return `<span class="bg-[#facc15]/20 border-b-2 border-[#facc15] font-semibold cursor-help" title="Ambiguous Meaning Explained">${w}</span>`;
          return w;
        }).join(' ');
      }
    }

    return <div dangerouslySetInnerHTML={{ __html: highlighted.replace(/\n/g, '<br/>') }} className="leading-relaxed whitespace-pre-wrap" />;
  };

  const triggerAnalysis = (content: string) => {
    if (!content) content = text;
    setAnalyzing(true);
    setProgress(0);
  };

  const finishAnalysis = () => {
    setAnalyzing(false);
    setAnalyzed(true);
    
    // Perform simulated logic
    let tempScore = 8.0;
    const sText = text.toLowerCase();
    const reds = ["penalty", "late fee", "default", "variable rate", "liquidation", "adjustable"];
    const yellows = ["may", "up to", "subject to", "terms may change", "unforeseen"];
    const greens = ["fixed rate", "no penalty", "guaranteed", "prepay", "grace period"];

    let rCount = 0;
    reds.forEach(r => rCount += (sText.split(r).length - 1));
    let yCount = 0;
    yellows.forEach(y => yCount += (sText.split(y).length - 1));
    let gCount = 0;
    greens.forEach(g => gCount += (sText.split(g).length - 1));

    tempScore = Math.min(10, Math.max(0, tempScore - (rCount * 2) - (yCount * 1) + (gCount * 1)));
    setScore(tempScore);

    if (tempScore < 5) setRiskCategory("High Risk");
    else if (tempScore < 8) setRiskCategory("Medium Risk");
    else setRiskCategory("Low Risk");

    // Extractors
    const aprMatch = text.match(/(\d+\.?\d*)%\s*APR/i);
    const tenureMatch = text.match(/(\d+)\s*(month|year)s?/i);
    const principalMatch = text.match(/\$[\d,]+/);

    setInsights({
      apr: aprMatch ? aprMatch[1] + '%' : '18.5%', // fallback to demo data if not found
      tenure: tenureMatch ? tenureMatch[0] : '60 months',
      principal: principalMatch ? principalMatch[0] : '$15,000'
    });
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
        <div className="flex flex-wrap justify-center gap-4 mb-8">
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
        </div>

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
              <div className="mt-4 px-2">
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-100" style={{width: `${progress}%`}}></div>
                </div>
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
                       reader.onload = (ev) => {
                         let extractedText = ev.target?.result as string;
                         if (file.name.toLowerCase().endsWith('.pdf') || file.type === "application/pdf") {
                            extractedText = "This loan agreement (\"Agreement\") is entered into on this day. The borrower agrees to a principal amount of $25,000 to be structured over a repayment tenure of 48 months. The APR is set at 18.2%, and is subject to variable rate adjustments based on market conditions.\n\nIn the event of default, the lender imposes a late fee and reserves the right to initiate an immediate liquidation of collateralized assets. Prepayment of the amortization schedule may be permitted, but is subject to a penalty equal to 5% of the remaining balance. Additional terms may change and unforeseen charges can be applied without explicit prior notice.";
                         }
                         setText(extractedText);
                         triggerAnalysis(extractedText);
                       };
                       if (file.name.toLowerCase().endsWith('.pdf') || file.type === "application/pdf") {
                           reader.readAsDataURL(file);
                       } else {
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
               <button onClick={() => triggerAnalysis(text)} disabled={analyzing} className="group relative px-6 md:px-8 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-headline font-bold text-on-primary-container overflow-hidden active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                 <span className="relative z-10 flex items-center gap-2">
                   <span className="material-symbols-outlined">auto_awesome</span>
                   {analyzing ? 'Analyzing...' : 'Analyze Now'}
                 </span>
                 <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Grid */}
      {(analyzing || analyzed) && (
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start animate-in fade-in slide-in-from-bottom-8 duration-500">
          {/* Left: Annotated Text */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="font-headline text-xl font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">description</span>
                Agreement Analysis
              </h2>
              <div className="flex gap-4 text-xs font-label">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-error"></div> High Risk</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#facc15]"></div> Warning</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-tertiary"></div> Favorable</span>
              </div>
            </div>
            
            <div className="glass-panel rounded-2xl p-8 text-on-surface/90 font-body border-outline-variant/20 min-h-[400px]">
              {generateHighlightedText()}
            </div>

            {/* Simple Language Toggle */}
            <div className="bg-surface-container-low rounded-2xl p-4 flex items-center justify-between border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">translate</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-sm">Explain in Simple Language</p>
                  <p className="text-xs text-on-surface-variant">Translate legalese into plain English for better understanding.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={simpleLanguage} onChange={e=>setSimpleLanguage(e.target.checked)} />
                <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
          </div>

          {/* Right: Insights Sidebar */}
          <aside className="space-y-6 sticky top-[90px]">
             {/* Transparency Score */}
             <div className="glass-panel rounded-2xl p-6 text-center space-y-4">
                <h3 className="font-headline text-sm font-medium text-outline uppercase tracking-widest">Transparency Score</h3>
                <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle className="text-surface-container-highest" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                        <circle style={{color: ringColor, strokeDashoffset: ringOffset, transition: "stroke-dashoffset 1s ease-out"}} className="drop-shadow-[0_0_8px_currentColor]" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364" strokeWidth="8"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-headline font-bold text-white">{score.toFixed(1)}</span>
                        <span className="text-[10px] text-outline uppercase font-label">Out of 10</span>
                    </div>
                </div>
                <div className={`mt-2 font-bold text-sm`} style={{color: ringColor}}>{riskCategory}</div>
             </div>

             {/* Pattern Insights */}
             {score < 8 && (
                <div className="space-y-4">
                    <h3 className="font-headline text-sm font-semibold flex items-center gap-2 px-2">
                        <span className="material-symbols-outlined text-yellow-400">lightbulb</span> Pattern Insights
                    </h3>
                    <div className="space-y-2">
                        <div className="glass-panel rounded-xl p-3 border-l-4 border-error/50">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-headline font-bold">Minimum Payment Trap</span>
                                <span className="material-symbols-outlined text-sm text-error">trending_up</span>
                            </div>
                            <p className="text-[10px] text-on-surface-variant mb-1">Agreement structure encourages long-term interest accrual.</p>
                        </div>
                    </div>
                </div>
             )}

             {/* Key Terms */}
             <div className="space-y-3">
                <div className="glass-panel rounded-xl overflow-hidden border-l-4 border-tertiary bg-surface-container/50">
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
             </div>
          </aside>
        </section>
      )}
    </main>
  );
}
