"use client";
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportPage() {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('FinSight_Report.pdf');
    } catch (err) {
      console.error(err);
    }
    setDownloading(false);
  };

  return (
    <main className="pt-24 px-8 max-w-7xl mx-auto min-h-screen relative">
      <div className="grid grid-cols-12 gap-6 blur-sm opacity-50 pointer-events-none">
        <div className="col-span-8 space-y-6">
          <div className="h-64 bg-surface-container-low rounded-xl"></div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-40 bg-surface-container-low rounded-xl"></div>
            <div className="h-40 bg-surface-container-low rounded-xl"></div>
          </div>
        </div>
        <div className="col-span-4 h-full bg-surface-container-low rounded-xl min-h-[400px]"></div>
      </div>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#131318]/80 backdrop-blur-md px-4 mt-16 sm:mt-0 pt-16">
        <div className="glass-panel w-full max-w-[850px] max-h-[90vh] rounded-[2rem] overflow-hidden flex flex-col shadow-2xl bg-[rgba(255,255,255,0.02)] border border-white/5">
          <div className="p-6 md:p-8 flex justify-between items-center border-b border-white/10 shrink-0">
            <div>
              <h2 className="text-2xl font-headline font-bold tracking-tight text-white">Report Generator</h2>
              <p className="text-on-surface-variant text-sm mt-1">Configure and preview your custom financial analysis.</p>
            </div>
            <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-outline">close</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            <aside className="w-full md:w-72 p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/5 space-y-8 overflow-y-auto shrink-0 bg-surface/50 hidden md:block">
              <div className="space-y-4">
                <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-secondary/70">Customization</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" /><span className="text-sm font-medium text-on-surface-variant group-hover:text-white transition-colors">Full Breakdown</span></label>
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" /><span className="text-sm font-medium text-on-surface-variant group-hover:text-white transition-colors">Comparison Data</span></label>
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" /><span className="text-sm font-medium text-on-surface-variant group-hover:text-white transition-colors">Risk Analysis</span></label>
                  <label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 accent-primary" /><span className="text-sm font-medium text-on-surface-variant group-hover:text-white transition-colors">Recommendations</span></label>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-secondary/70">Timeframe</h3>
                <select className="w-full bg-surface-container-high border-outline-variant/30 rounded-xl text-sm focus:border-secondary focus:ring-secondary transition-all p-2 text-white">
                  <option>Last 12 Months</option>
                  <option>Quarter to Date</option>
                  <option>Year to Date</option>
                  <option>Custom Range</option>
                </select>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/10">
                  <p className="text-[10px] text-secondary/80 uppercase font-bold tracking-tighter mb-1">PRO Feature</p>
                  <p className="text-xs text-white/60 leading-relaxed">Unlock advanced sectoral benchmarks for a deeper comparison.</p>
                </div>
              </div>
            </aside>

            <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-surface-container-lowest/40" ref={reportRef}>
              <div className="space-y-10">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-headline font-bold text-secondary uppercase tracking-[0.2em] mb-2">Internal Preview</div>
                    <h1 className="text-3xl font-headline font-bold tracking-tighter text-white">Q3 Alpha Portfolio Analysis</h1>
                    <p className="text-on-surface-variant text-sm mt-1">Generated for: <span className="text-primary">Stitch User</span> • {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="p-3 bg-surface-container-high rounded-2xl border border-white/5 shadow-inner">
                    <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>description</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-surface-container-high to-surface-container border border-white/5 flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-on-surface-variant text-xs font-headline uppercase tracking-wider font-bold">Overall Risk Score</h4>
                      <div className="text-5xl font-headline font-bold text-white tracking-tighter">74<span className="text-lg text-secondary">/100</span></div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-bold">
                        <span className="material-symbols-outlined text-xs">trending_down</span> LOW RISK
                      </div>
                    </div>
                    <div className="w-24 h-24 relative flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="48" cy="48" fill="transparent" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8"></circle>
                        <circle cx="48" cy="48" fill="transparent" r="40" stroke="#4cd7f6" strokeDasharray="251.2" strokeDashoffset="65" strokeWidth="8" className="drop-shadow-[0_0_8px_#4cd7f6]"></circle>
                      </svg>
                      <span className="absolute material-symbols-outlined text-white/40">shield_with_heart</span>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl border border-white/5 bg-surface-container-high flex flex-col justify-between">
                    <h4 className="text-on-surface-variant text-xs font-headline uppercase tracking-wider font-bold">Total Exposure</h4>
                    <div>
                      <div className="text-2xl font-headline font-bold text-white">$42.8M</div>
                      <div className="text-tertiary text-xs">+12.4% vs last period</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-on-surface-variant text-xs font-headline uppercase tracking-wider font-bold">Sector Breakdown</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-surface-container border border-white/5 flex flex-col gap-3">
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-primary w-[65%]" /></div>
                      <span className="text-[10px] font-bold text-white/80">FINTECH</span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-container border border-white/5 flex flex-col gap-3">
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-secondary w-[40%]" /></div>
                      <span className="text-[10px] font-bold text-white/80">HEALTHCARE</span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-container border border-white/5 flex flex-col gap-3">
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-tertiary w-[15%]" /></div>
                      <span className="text-[10px] font-bold text-white/80">RETAIL</span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-container border border-white/5 flex flex-col gap-3">
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-outline w-[10%]" /></div>
                      <span className="text-[10px] font-bold text-white/80">OTHERS</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-on-surface-variant text-xs font-headline uppercase tracking-wider font-bold">Key Recommendations</h4>
                  <ul className="space-y-4">
                    <li className="flex gap-4 p-4 rounded-2xl bg-surface-container-high/40 border border-white/5">
                      <div className="w-8 h-8 rounded-full bg-tertiary/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-tertiary text-sm">auto_awesome</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Optimize liquidity buffer</p>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Current cash reserves are 4% below recommended benchmarks.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-white/10 flex flex-wrap gap-4 justify-between items-center bg-surface-container shrink-0">
            <div className="flex flex-wrap gap-3">
              <button disabled={downloading} onClick={downloadPDF} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-on-primary font-headline text-sm font-bold hover:shadow-[0_0_15px_rgba(183,109,255,0.4)] transition-all active:scale-[0.95] disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                {downloading ? 'Processing...' : 'Download PDF'}
              </button>
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-secondary text-on-secondary font-headline text-sm font-bold transition-all hover:bg-secondary/90 active:scale-[0.95] hidden sm:flex">
                <span className="material-symbols-outlined text-sm">mail</span>
                Email Report
              </button>
            </div>
            <button onClick={() => router.back()} className="text-on-surface-variant hover:text-white text-xs font-bold font-headline uppercase tracking-widest transition-colors hidden sm:block">
              Discard Draft
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
