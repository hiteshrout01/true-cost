"use client";
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useReportData } from '@/context/ReportContext';
import ReportPreview from './ReportPreview';

export default function ReportModal() {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { reportData, toggleOption } = useReportData();
  const { selectedOptions } = reportData;

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
      pdf.save('FinSight_Dynamic_Report.pdf');
    } catch (err) {
      console.error(err);
    }
    setDownloading(false);
  };

  const isChecked = (id: string) => selectedOptions.includes(id);

  return (
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
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={isChecked("full_breakdown")} onChange={() => toggleOption("full_breakdown")} className="w-4 h-4 accent-primary" />
                    <span className="text-sm font-medium text-on-surface-variant group-hover:text-white transition-colors">Full Breakdown</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={isChecked("comparison_data")} onChange={() => toggleOption("comparison_data")} className="w-4 h-4 accent-primary" />
                    <span className="text-sm font-medium text-on-surface-variant group-hover:text-white transition-colors">Comparison Data</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={isChecked("risk_analysis")} onChange={() => toggleOption("risk_analysis")} className="w-4 h-4 accent-primary" />
                    <span className="text-sm font-medium text-on-surface-variant group-hover:text-white transition-colors">Risk Analysis</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                     <input type="checkbox" checked={isChecked("recommendations")} onChange={() => toggleOption("recommendations")} className="w-4 h-4 accent-primary" />
                     <span className="text-sm font-medium text-on-surface-variant group-hover:text-white transition-colors">Recommendations</span>
                  </label>
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

            {/* PREVIEW CONTAINER */}
            <ReportPreview ref={reportRef} />
          </div>

          <div className="p-6 border-t border-white/10 flex flex-wrap gap-4 justify-between items-center bg-surface-container shrink-0">
            <div className="flex flex-wrap gap-3">
              <button disabled={downloading || !reportData.analysis} onClick={downloadPDF} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-on-primary font-headline text-sm font-bold hover:shadow-[0_0_15px_rgba(183,109,255,0.4)] transition-all active:scale-[0.95] disabled:opacity-50 cursor-pointer">
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                {downloading ? 'Processing...' : 'Download PDF'}
              </button>
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-secondary text-on-secondary font-headline text-sm font-bold transition-all hover:bg-secondary/90 active:scale-[0.95] hidden sm:flex cursor-pointer">
                <span className="material-symbols-outlined text-sm">mail</span>
                Email Report
              </button>
            </div>
            <button onClick={() => router.back()} className="text-on-surface-variant hover:text-white text-xs font-bold font-headline uppercase tracking-widest transition-colors hidden sm:block cursor-pointer">
              Discard Draft
            </button>
          </div>
        </div>
      </div>
  );
}
