"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ComparisonPage() {
  const [optA, setOptA] = useState({ amount: 450000, rate: 6.5, tenure: 30 });
  const [optB, setOptB] = useState({ amount: 450000, rate: 5.8, tenure: 30 });
  const [optC, setOptC] = useState({ amount: 450000, rate: 6.1, tenure: 30 });

  const calculate = (amount: number, rate: number, tenure: number) => {
    const r = (rate / 12) / 100;
    const n = tenure * 12;
    const emi = r > 0 ? (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : amount / n;
    const totalCost = emi * n;
    const totalInterest = totalCost - amount;
    return { emi, totalInterest, totalCost };
  };

  const resA = calculate(optA.amount, optA.rate, optA.tenure);
  const resB = calculate(optB.amount, optB.rate, optB.tenure);
  const resC = calculate(optC.amount, optC.rate, optC.tenure);

  const chartData = useMemo(() => {
    const data = [];
    const maxYears = Math.max(optA.tenure, optB.tenure, optC.tenure);
    for (let year = 0; year <= maxYears; year += Math.max(1, Math.floor(maxYears/10))) {
      const month = year * 12;
      data.push({
        year,
        costA: Math.min(resA.emi * month, resA.totalCost),
        costB: Math.min(resB.emi * month, resB.totalCost),
        costC: Math.min(resC.emi * month, resC.totalCost),
      });
    }
    return data;
  }, [optA, optB, optC, resA, resB, resC]);

  const costs = [
    { name: 'Option A', cost: resA.totalCost, color: 'text-primary', index: 'A' },
    { name: 'Option B', cost: resB.totalCost, color: 'text-secondary', index: 'B' },
    { name: 'Option C', cost: resC.totalCost, color: 'text-[#3b82f6]', index: 'C' }
  ];
  const sorted = [...costs].sort((a, b) => a.cost - b.cost);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const savings = worst.cost - best.cost;

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <main className="pt-28 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto min-h-screen">
      <header className="mb-12 flex justify-between items-start">
        <div>
          <h1 className="text-display-lg font-headline font-bold text-5xl tracking-tight mb-2">Compare Financial Products</h1>
          <p className="text-on-surface-variant max-w-2xl font-body">Input your loan, credit, or mortgage terms to visualize the long-term impact. Our engine calculates the hidden fees that standard bank tools ignore.</p>
        </div>
        <Link href="/" className="px-4 py-2 glass-panel rounded-xl border border-white/10 flex items-center gap-2 hover:bg-white/5 text-[10px] font-headline font-bold uppercase tracking-widest transition-all text-on-surface-variant group">
           <span className="material-symbols-outlined text-sm group-hover:text-white transition-colors">close</span>
           Exit tool
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {/* Option A */}
        <div className="glass-panel p-6 rounded-2xl border border-[#ddb7ff]/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] relative overflow-hidden flex flex-col h-full bg-[rgba(255,255,255,0.03)] backdrop-blur-[12px]">
          <div className="absolute top-0 right-0 p-4"><span className="text-xs font-headline text-primary opacity-50 tracking-widest font-bold">OPTION A</span></div>
          <h3 className="text-xl font-headline font-semibold mb-6 text-primary">Standard Mortgage</h3>
          <div className="space-y-6 flex-grow">
            <div>
              <label className="block text-xs font-headline mb-2 text-on-surface-variant uppercase tracking-widest">Loan Amount</label>
              <input type="number" className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 font-headline text-xl focus:border-primary focus:ring-0 outline-none transition-all text-white" value={optA.amount} onChange={e=>setOptA({...optA, amount: Number(e.target.value)})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-headline mb-2 text-on-surface-variant uppercase tracking-widest">Int. Rate (%)</label>
                <input type="number" step="0.1" className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 font-headline text-lg focus:border-primary outline-none transition-all text-white" value={optA.rate} onChange={e=>setOptA({...optA, rate: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-headline mb-2 text-on-surface-variant uppercase tracking-widest">Tenure (Yrs)</label>
                <input type="number" className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 font-headline text-lg focus:border-primary outline-none transition-all text-white" value={optA.tenure} onChange={e=>setOptA({...optA, tenure: Number(e.target.value)})} />
              </div>
            </div>
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-end"><span className="text-xs text-on-surface-variant font-headline tracking-widest uppercase">Monthly EMI</span><span className="text-2xl font-headline font-bold text-white">{formatCurrency(resA.emi)}</span></div>
              <div className="flex justify-between items-end"><span className="text-xs text-on-surface-variant font-headline tracking-widest uppercase">Total Int.</span><span className="text-xl font-headline font-semibold text-primary/80">{formatCurrency(resA.totalInterest)}</span></div>
              <div className="flex justify-between items-end p-4 bg-surface-container-high rounded-xl"><span className="text-sm text-white font-headline uppercase tracking-widest">Total Cost</span><span className="text-3xl font-headline font-black text-white">{formatCurrency(resA.totalCost)}</span></div>
            </div>
          </div>
        </div>

        {/* Option B */}
        <div className="glass-panel p-6 rounded-2xl border border-secondary/20 shadow-[0_0_20px_rgba(76,215,246,0.15)] relative overflow-hidden flex flex-col h-full bg-[rgba(255,255,255,0.03)] backdrop-blur-[12px] ring-2 ring-secondary/40">
          {best.index === 'B' && (
            <div className="absolute top-4 left-4 z-20 bg-secondary-container/20 border border-secondary text-secondary font-headline font-black text-xs tracking-tighter px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_0_15px_rgba(76,215,246,0.3)]">
              <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span> BEST VALUE
            </div>
          )}
          <div className="absolute top-0 right-0 p-4"><span className="text-xs font-headline text-secondary opacity-50 tracking-widest font-bold">OPTION B</span></div>
          <h3 className="text-xl font-headline font-semibold mb-6 text-secondary mt-8">Flexi-Premium Loan</h3>
          <div className="space-y-6 flex-grow">
            <div>
              <label className="block text-xs font-headline mb-2 text-on-surface-variant uppercase tracking-widest">Loan Amount</label>
              <input type="number" className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 font-headline text-xl focus:border-secondary focus:ring-0 outline-none transition-all text-white" value={optB.amount} onChange={e=>setOptB({...optB, amount: Number(e.target.value)})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-headline mb-2 text-on-surface-variant uppercase tracking-widest">Int. Rate (%)</label>
                <input type="number" step="0.1" className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 font-headline text-lg focus:border-secondary outline-none transition-all text-white" value={optB.rate} onChange={e=>setOptB({...optB, rate: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-headline mb-2 text-on-surface-variant uppercase tracking-widest">Tenure (Yrs)</label>
                <input type="number" className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 font-headline text-lg focus:border-secondary outline-none transition-all text-white" value={optB.tenure} onChange={e=>setOptB({...optB, tenure: Number(e.target.value)})} />
              </div>
            </div>
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-end"><span className="text-xs text-on-surface-variant font-headline tracking-widest uppercase">Monthly EMI</span><span className="text-2xl font-headline font-bold text-white">{formatCurrency(resB.emi)}</span></div>
              <div className="flex justify-between items-end"><span className="text-xs text-on-surface-variant font-headline tracking-widest uppercase">Total Int.</span><span className="text-xl font-headline font-semibold text-secondary/80">{formatCurrency(resB.totalInterest)}</span></div>
              <div className="flex justify-between items-end p-4 bg-secondary-container/10 rounded-xl border border-secondary/20"><span className="text-sm text-white font-headline uppercase tracking-widest">Total Cost</span><span className="text-3xl font-headline font-black text-secondary">{formatCurrency(resB.totalCost)}</span></div>
            </div>
          </div>
        </div>

        {/* Option C */}
        <div className="glass-panel p-6 rounded-2xl border border-[#3b82f6]/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] relative overflow-hidden flex flex-col h-full bg-[rgba(255,255,255,0.03)] backdrop-blur-[12px]">
          <div className="absolute top-0 right-0 p-4"><span className="text-xs font-headline text-[#3b82f6] opacity-50 tracking-widest font-bold">OPTION C</span></div>
          <h3 className="text-xl font-headline font-semibold mb-6 text-[#3b82f6]">Smart-Saver Pro</h3>
          <div className="space-y-6 flex-grow">
            <div>
              <label className="block text-xs font-headline mb-2 text-on-surface-variant uppercase tracking-widest">Loan Amount</label>
              <input type="number" className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 font-headline text-xl focus:border-[#3b82f6] focus:ring-0 outline-none transition-all text-white" value={optC.amount} onChange={e=>setOptC({...optC, amount: Number(e.target.value)})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-headline mb-2 text-on-surface-variant uppercase tracking-widest">Int. Rate (%)</label>
                <input type="number" step="0.1" className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 font-headline text-lg focus:border-[#3b82f6] outline-none transition-all text-white" value={optC.rate} onChange={e=>setOptC({...optC, rate: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-headline mb-2 text-on-surface-variant uppercase tracking-widest">Tenure (Yrs)</label>
                <input type="number" className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 font-headline text-lg focus:border-[#3b82f6] outline-none transition-all text-white" value={optC.tenure} onChange={e=>setOptC({...optC, tenure: Number(e.target.value)})} />
              </div>
            </div>
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-end"><span className="text-xs text-on-surface-variant font-headline tracking-widest uppercase">Monthly EMI</span><span className="text-2xl font-headline font-bold text-white">{formatCurrency(resC.emi)}</span></div>
              <div className="flex justify-between items-end"><span className="text-xs text-on-surface-variant font-headline tracking-widest uppercase">Total Int.</span><span className="text-xl font-headline font-semibold text-[#3b82f6]/80">{formatCurrency(resC.totalInterest)}</span></div>
              <div className="flex justify-between items-end p-4 bg-surface-container-high rounded-xl"><span className="text-sm text-white font-headline uppercase tracking-widest">Total Cost</span><span className="text-3xl font-headline font-black text-[#3b82f6]/80">{formatCurrency(resC.totalCost)}</span></div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="text-2xl font-headline font-bold mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">insights</span> Cost Trajectory Analysis
        </h2>
        <div className="glass-panel rounded-2xl p-4 md:p-8 h-[400px] relative overflow-hidden bg-[rgba(255,255,255,0.01)] border-white/10">
          <div className="absolute inset-0 bg-secondary/10 blur-[100px] rounded-[50%] animate-pulse pointer-events-none" style={{ animationDuration: '5s' }}></div>
          <ResponsiveContainer width="100%" height="100%" className="relative z-10">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="year" stroke="#988d9f" tickFormatter={(v) => `Year ${v}`} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#131318', border: '1px solid rgba(77, 67, 84, 0.4)', borderRadius: '8px' }}
                 itemStyle={{ fontFamily: 'Space Grotesk' }}
                 formatter={(value: any) => formatCurrency(Number(value))}
              />
              <Line 
                type="monotone" 
                dataKey="costA" 
                name="Option A" 
                stroke="#ddb7ff" 
                strokeWidth={4} 
                dot={false}
                activeDot={{ r: 8, fill: "#fff", stroke: "#ddb7ff", strokeWidth: 3, style: { filter: 'drop-shadow(0px 0px 15px #ddb7ff)' } }}
              />
              <Line 
                type="monotone" 
                dataKey="costB" 
                name="Option B" 
                stroke="#4cd7f6" 
                strokeWidth={4} 
                dot={false}
                activeDot={{ r: 8, fill: "#fff", stroke: "#4cd7f6", strokeWidth: 3, style: { filter: 'drop-shadow(0px 0px 15px #4cd7f6)' } }}
              />
              <Line 
                type="monotone" 
                dataKey="costC" 
                name="Option C" 
                stroke="#3b82f6" 
                strokeWidth={4} 
                strokeDasharray="8 8" 
                dot={false}
                activeDot={{ r: 8, fill: "#fff", stroke: "#3b82f6", strokeWidth: 3, style: { filter: 'drop-shadow(0px 0px 15px #3b82f6)' } }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="absolute bottom-12 right-12 flex flex-col gap-2 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 hidden md:flex">
             <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-primary"></div><span className="text-xs font-headline text-white">Option A: High Interest</span></div>
             <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-secondary"></div><span className="text-xs font-headline text-white">Option B: Low Interest</span></div>
             <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div><span className="text-xs font-headline text-white">Option C: Mid Interest</span></div>
             {savings > 0 && <div className="mt-2 text-tertiary font-headline font-bold text-lg">-{formatCurrency(savings)} MAX SAVED</div>}
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section className="mt-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <h2 className="text-3xl font-headline font-bold">Deep Dive Analysis</h2>
          <div className="flex gap-2">
            <button className="border border-white/10 px-4 py-2 rounded-xl text-xs font-headline hover:bg-white/5 transition-all">Export CSV</button>
            <button className="border border-white/10 px-4 py-2 rounded-xl text-xs font-headline hover:bg-white/5 transition-all">Print PDF</button>
          </div>
        </div>
        <div className="overflow-x-auto glass-panel rounded-2xl border border-white/5">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-surface-container-high/50 border-b border-white/5">
              <tr>
                <th className="p-6 font-headline font-semibold text-on-surface-variant text-sm">Metric</th>
                <th className="p-6 font-headline font-semibold text-primary text-sm">Option A</th>
                <th className="p-6 font-headline font-semibold text-secondary text-sm">Option B</th>
                <th className="p-6 font-headline font-semibold text-[#3b82f6] text-sm">Option C</th>
                <th className="p-6 font-headline font-semibold text-white text-sm">Variance (B-A)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-6 font-body text-on-surface-variant text-sm">Origination Fee</td>
                <td className="p-6 font-headline">₹1,200</td>
                <td className="p-6 font-headline bg-tertiary/10 text-tertiary shadow-[inset_0_0_15px_rgba(78,222,163,0.1)]">₹850</td>
                <td className="p-6 font-headline">₹1,100</td>
                <td className="p-6 font-headline text-tertiary text-sm font-bold">-29.1%</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-6 font-body text-on-surface-variant text-sm">Annual Maintenance</td>
                <td className="p-6 font-headline bg-tertiary/10 text-tertiary shadow-[inset_0_0_15px_rgba(78,222,163,0.1)]">₹0</td>
                <td className="p-6 font-headline">₹150</td>
                <td className="p-6 font-headline">₹200</td>
                <td className="p-6 font-headline text-error text-sm font-bold">+₹150</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-6 font-body text-on-surface-variant text-sm">Early Pre-payment</td>
                <td className="p-6 font-headline">2%</td>
                <td className="p-6 font-headline bg-tertiary/10 text-tertiary shadow-[inset_0_0_15px_rgba(78,222,163,0.1)]">None</td>
                <td className="p-6 font-headline">1%</td>
                <td className="p-6 font-headline text-tertiary text-sm font-bold">Favorable</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-6 font-body text-on-surface-variant text-sm">Late Payment Grace</td>
                <td className="p-6 font-headline">5 Days</td>
                <td className="p-6 font-headline bg-tertiary/10 text-tertiary shadow-[inset_0_0_15px_rgba(78,222,163,0.1)]">15 Days</td>
                <td className="p-6 font-headline">10 Days</td>
                <td className="p-6 font-headline text-tertiary text-sm font-bold">+10 Days</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-6 font-body text-on-surface-variant text-sm">Compounding</td>
                <td className="p-6 font-headline">Monthly</td>
                <td className="p-6 font-headline bg-tertiary/10 text-tertiary shadow-[inset_0_0_15px_rgba(78,222,163,0.1)]">Quarterly</td>
                <td className="p-6 font-headline">Monthly</td>
                <td className="p-6 font-headline text-tertiary text-sm font-bold">Favorable</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-20 mb-20 text-center">
        <div className="inline-block relative w-full">
            <div className="absolute inset-0 bg-secondary/10 blur-[100px] rounded-full"></div>
            <div className="relative glass-panel border border-secondary/40 p-12 rounded-3xl max-w-3xl mx-auto overflow-hidden bg-surface-container-highest/50">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 blur-3xl rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full"></div>
                
                <span className="inline-block px-4 py-1 rounded-full bg-secondary-container text-on-secondary-container font-headline font-bold text-xs mb-6 uppercase tracking-widest">Engine Verdict</span>
                <h2 className="text-4xl font-headline font-bold mb-4 tracking-tight">Option {best.index} is your <span className="text-secondary">Optimal Path</span></h2>
                <p className="text-on-surface-variant font-body mb-8">
                  By choosing {best.name}, you reduce your total debt obligation by <span className="text-white font-bold">{formatCurrency(savings)}</span> compared to the worst option, maximizing your long term retention.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-4 bg-secondary text-on-secondary font-headline font-bold rounded-xl hover:scale-[0.98] transition-all shadow-[0_0_15px_rgba(76,215,246,0.3)]">Proceed with Option {best.index}</button>
                    <button className="px-8 py-4 bg-white/5 border border-white/10 font-headline font-bold rounded-xl hover:bg-white/10 transition-all">Schedule Advisor Call</button>
                </div>
            </div>
        </div>
      </section>
    </main>
  );
}
