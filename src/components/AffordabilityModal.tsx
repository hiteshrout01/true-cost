"use client";
import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AffordabilityModal({ isOpen, onClose }: Props) {
  const [income, setIncome] = useState("8500");
  const [expenses, setExpenses] = useState("3200");
  const [emi, setEmi] = useState("450");
  const [savings, setSavings] = useState("125000");
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-[#131318]/90 backdrop-blur-md px-4 py-8 overflow-y-auto flex items-start justify-center">
      <div className="w-full max-w-[900px] rounded-[2.5rem] shadow-2xl flex flex-col my-auto border border-white/10 bg-[#131318]/50 overflow-hidden relative mt-8 sm:mt-auto">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-xl pointer-events-none"></div>
        <div className="relative z-10 w-full flex flex-col pointer-events-auto">
        {/* Modal Header */}
        <div className="p-8 pb-4 flex justify-between items-start relative">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary">calculate</span>
              </div>
              <h2 className="text-3xl font-headline font-bold tracking-tight text-white">Affordability Intelligence</h2>
            </div>
            <p className="text-on-surface-variant text-sm ml-[52px]">AI-powered simulation to determine your financial reach and boundaries.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/20 transition-all shadow-sm">
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-8 pb-8">
          <div className="inline-flex p-1.5 bg-surface-container rounded-2xl border border-white/5 bg-[#1f1f25]">
            <button className="px-6 py-2.5 rounded-xl bg-secondary text-on-secondary font-headline text-sm font-bold shadow-lg transition-all text-[#003640]">
              What can I afford?
            </button>
            <button className="px-6 py-2.5 rounded-xl text-on-surface-variant hover:text-white font-headline text-sm font-medium transition-all">
              Income needed
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 border-t border-white/10">
          {/* Left Section: Inputs */}
          <div className="flex-1 p-8 space-y-6">
            <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-[#4cd7f6]/70">Financial Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase ml-1">Monthly Income (Post-Tax)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold">$</span>
                  <input className="w-full pl-8 pr-4 py-3.5 bg-surface-container-high border-outline-variant/30 rounded-2xl text-white font-headline focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all bg-[#2a292f] border border-[#4d4354]/30" type="number" value={income} onChange={(e) => setIncome(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase ml-1">Monthly Expenses</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold">$</span>
                  <input className="w-full pl-8 pr-4 py-3.5 bg-surface-container-high border-outline-variant/30 rounded-2xl text-white font-headline focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all bg-[#2a292f] border border-[#4d4354]/30" type="number" value={expenses} onChange={(e) => setExpenses(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase ml-1">Current EMIs / Debts</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold">$</span>
                  <input className="w-full pl-8 pr-4 py-3.5 bg-surface-container-high border-outline-variant/30 rounded-2xl text-white font-headline focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all bg-[#2a292f] border border-[#4d4354]/30" type="number" value={emi} onChange={(e) => setEmi(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase ml-1">Liquid Savings (Downpayment)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold">$</span>
                  <input className="w-full pl-8 pr-4 py-3.5 bg-surface-container-high border-outline-variant/30 rounded-2xl text-white font-headline focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all bg-[#2a292f] border border-[#4d4354]/30" type="number" value={savings} onChange={(e) => setSavings(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-secondary to-[#03b5d3] text-[#003640] font-headline font-bold tracking-tight shadow-[0_0_20px_rgba(76,215,246,0.3)] hover:shadow-[0_0_30px_rgba(76,215,246,0.5)] outline-none transition-all hover:-translate-y-0.5 active:translate-y-0">
                Calculate Intelligence
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#1b1b20] border border-white/5 flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-lg mt-0.5">info</span>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">Intelligence based on 30% debt-to-income ratio guidelines. These figures are estimates and do not constitute a financial offer.</p>
            </div>
          </div>

          {/* Right Section: Intelligence Output */}
          <div className="w-full lg:w-[380px] p-8 bg-black/20 lg:border-l border-white/10 flex flex-col gap-8">
            <div>
              <h4 className="text-on-surface-variant text-xs font-headline uppercase tracking-wider font-bold mb-6">Simulation Result</h4>
              <div className="space-y-1">
                <span className="text-xs font-headline font-bold text-secondary uppercase tracking-[0.2em]">Safe Loan Amount</span>
                <div className="text-5xl font-headline font-extrabold text-white tracking-tighter">₹642,500</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-on-surface-variant uppercase">Risk Profile</span>
                <span className="text-xs font-bold text-[#4edea3]">SAFE ZONE</span>
              </div>
              <div className="h-3 w-full bg-[#2a292f] rounded-full overflow-hidden flex">
                <div className="h-full bg-[#4edea3] w-[65%] shadow-[0_0_10px_rgba(78,222,163,0.5)]"></div>
                <div className="h-full bg-primary/20 w-[20%]"></div>
                <div className="h-full bg-red-500/20 w-[15%]"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="p-5 rounded-[2rem] bg-gradient-to-br from-[#2a292f] to-[#35343a] border border-white/10 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-sm">payments</span>
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Monthly Affordability</span>
                </div>
                <div className="text-3xl font-headline font-bold text-white mb-1">₹2,550 <span className="text-sm text-on-surface-variant font-medium">/mo</span></div>
                <p className="text-[10px] text-on-surface-variant leading-tight">Recommended monthly installment for balanced cash flow.</p>
              </div>

               <div className="p-5 rounded-[2rem] border border-secondary/20 bg-white/5 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-secondary text-lg">insights</span>
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest">Growth Forecast</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">At current appreciation rates, this asset could reach <span className="text-white font-bold">₹780k</span> value by 2027.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-8 border-t border-white/10 bg-[#1f1f25] flex justify-end gap-4">
          <button className="px-8 py-3 rounded-xl border border-white/10 text-on-surface-variant font-headline text-sm font-bold hover:bg-white/5 transition-all">
            Reset
          </button>
          <button className="px-8 py-3 rounded-xl bg-white text-[#131318] font-headline text-sm font-bold hover:bg-white/90 shadow-xl transition-all">
            Export Analysis
          </button>
        </div>
        
        </div>
      </div>
    </div>
  );
}
