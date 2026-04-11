"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');

  const selectLang = (lang: string) => {
    setCurrentLang(lang);
    setLangOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full h-[70px] z-50 bg-background/50 backdrop-blur-lg border-b border-white/10 dark:border-[#4d4354]/20 shadow-[0_4px_20px_rgba(168,85,247,0.1)] flex justify-between items-center px-8 mx-auto">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#a855f7] to-[#4cd7f6] font-headline tracking-tight uppercase">FINSIGHT</span>
        <div className="hidden md:flex gap-6">
          <Link href="/" className="font-headline tracking-tight text-sm font-medium text-white/70 hover:text-white transition-colors">Dashboard</Link>
          <Link href="/calculator" className="font-headline tracking-tight text-sm font-medium text-white/70 hover:text-white transition-colors">Calculator</Link>
          <Link href="/xray" className="font-headline tracking-tight text-sm font-medium text-white/70 hover:text-white transition-colors">X-Ray</Link>
          <Link href="/comparison" className="font-headline tracking-tight text-sm font-medium text-white/70 hover:text-white transition-colors">Compare</Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <div className="relative">
          <button 
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1 text-white/70 hover:text-white transition-colors cursor-pointer bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20"
          >
            <span className="material-symbols-outlined text-[18px]">language</span>
            <span className="font-headline text-sm font-bold">{currentLang}</span>
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
          
          {langOpen && (
            <div className="absolute top-full right-0 mt-3 w-36 bg-[#131318]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50">
              <div className="py-1">
                {['EN', 'ES', 'FR', 'DE', 'ZH'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => selectLang(lang)}
                    className={`w-full text-left px-4 py-2.5 font-headline text-sm transition-all focus:outline-none flex justify-between items-center ${
                      currentLang === lang 
                        ? 'text-primary font-bold bg-primary/10 pl-5 border-l-2 border-primary' 
                        : 'text-white/70 hover:bg-white/5 hover:pl-5 hover:text-white'
                    }`}
                  >
                    <span>
                      {lang === 'EN' ? 'English' : 
                       lang === 'ES' ? 'Español' : 
                       lang === 'FR' ? 'Français' : 
                       lang === 'DE' ? 'Deutsch' : '中文'}
                    </span>
                    {currentLang === lang && <span className="material-symbols-outlined text-[16px]">check</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Link href="/report" className="px-5 py-2 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-headline font-bold text-sm hover:shadow-[0_0_15px_rgba(221,183,255,0.4)] transition-all duration-300">
            Generate Report
        </Link>
        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer text-2xl hover:text-white transition-colors">account_circle</span>
      </div>
    </nav>
  );
}
