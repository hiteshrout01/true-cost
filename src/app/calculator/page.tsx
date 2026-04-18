"use client";
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function CalculatorPage() {
  const [principal, setPrincipal] = useState(250000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(120);
  const [processingFee, setProcessingFee] = useState(false);
  const [realityShock, setRealityShock] = useState(false);
  
  // Advanced Controls
  const [payExtra, setPayExtra] = useState(0);
  const [oneTimePayment, setOneTimePayment] = useState(0);
  const [stressTest, setStressTest] = useState(false);

  const { emi, totalInterest, totalPayable, chartData, riskScore } = useMemo(() => {
    let p = principal - oneTimePayment;
    let rRate = rate;
    let n = tenure;
    let extraCosts = 0;

    if (stressTest) {
        rRate += 2.0; // Simulate +2% rate hike
    }

    if (realityShock) {
      n += 2;
      extraCosts += 100; // 2 missed payments * ₹50
    }

    const mRate = (rRate / 12) / 100;
    
    // Custom calculation with extra payment
    let standardEmi = 0;
    if (mRate > 0) {
      standardEmi = (p * mRate * Math.pow(1 + mRate, n)) / (Math.pow(1 + mRate, n) - 1);
    } else {
      standardEmi = p / n;
    }

    let actualEmi = standardEmi + payExtra;
    
    // Recalculate true tenure if paying extra
    let effectiveTenure = n;
    if (payExtra > 0 && mRate > 0) {
      const denom = (actualEmi - p * mRate);
      if (denom > 0) {
        effectiveTenure = Math.log(actualEmi / denom) / Math.log(1 + mRate);
      }
    }

    const tInterest = (actualEmi * effectiveTenure) - p;
    let tPayable = p + tInterest + extraCosts;

    if (processingFee) {
      tPayable += (principal * 0.02);
    }

    const data = [];
    const points = Math.min(Math.ceil(effectiveTenure), 360);
    for (let i = 0; i <= points; i += Math.max(1, Math.floor(points/20))) {
      data.push({
        month: i,
        principal: (p / points) * i,
        totalCost: actualEmi * i
      });
    }

    return {
      emi: actualEmi,
      totalInterest: tInterest > 0 ? tInterest : 0,
      totalPayable: tPayable > 0 ? tPayable : p,
      chartData: data,
      riskScore: (actualEmi / 5000) * 100 // Abstract risk factor based on avg ₹5k income
    };
  }, [principal, rate, tenure, processingFee, realityShock, payExtra, oneTimePayment, stressTest]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <main className={`pt-[70px] min-h-screen w-full max-w-[1440px] mx-auto flex flex-col md:flex-row ${stressTest ? 'stress-test-active' : ''}`}>
      {/* Left Side */}
      <section className="w-full md:w-[60%] p-8 md:p-12 space-y-12">
        <header>
          <h1 className="text-5xl md:text-6xl font-headline font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-br from-primary via-primary-container to-secondary">
            Calculate Your<br/>FinSight
          </h1>
          <p className="mt-4 text-on-surface-variant font-body max-w-lg">
            Unveil the hidden layers of your financial commitments with our high-precision luminescent ledger.
          </p>
        </header>

        <div className="space-y-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center font-label">
                <span className="text-on-surface/80 text-sm">Loan Amount</span>
                <span className="text-primary font-bold text-lg">{formatCurrency(principal)}</span>
              </div>
              <input type="range" className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" 
                     min="1000" max="1000000" step="1000" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center font-label">
                <span className="text-on-surface/80 text-sm">Interest Rate</span>
                <span className="text-secondary font-bold text-lg">{rate.toFixed(1)}%</span>
              </div>
              <input type="range" className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-secondary" 
                     min="1" max="36" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center font-label">
                <span className="text-on-surface/80 text-sm">Tenure (Months)</span>
                <span className="text-[#03b5d3] font-bold text-lg">{tenure} mo</span>
              </div>
              <input type="range" className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#03b5d3]" 
                     min="6" max="360" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-label text-xs uppercase tracking-[0.2em] text-outline font-bold">Scenario Controls</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel p-4 rounded-xl ghost-border flex flex-col gap-2">
                <span className="text-[10px] font-label text-on-surface/60 uppercase">Pay Extra Monthly</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold font-headline">${payExtra}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPayExtra(Math.max(0, payExtra - 50))} className="w-6 h-6 rounded bg-white/5 flex items-center justify-center hover:bg-white/10">-</button>
                    <button onClick={() => setPayExtra(payExtra + 50)} className="w-6 h-6 rounded bg-white/5 flex items-center justify-center hover:bg-white/10">+</button>
                  </div>
                </div>
              </div>
              <div className="glass-panel p-4 rounded-xl ghost-border flex flex-col gap-2 relative group overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <span className="text-[10px] font-label text-on-surface/60 uppercase tracking-widest font-bold">One-Time Payment</span>
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-sm font-bold font-headline text-primary">${oneTimePayment.toLocaleString()}</span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setOneTimePayment(Math.max(0, oneTimePayment - 1000))} 
                      className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 hover:text-white transition-all border border-primary/20 active:scale-95 shadow-lg"
                      title="Decrease by $1,000"
                    >
                      <span className="material-symbols-outlined text-lg">remove</span>
                    </button>
                    <button 
                      onClick={() => setOneTimePayment(oneTimePayment + 1000)} 
                      className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center hover:bg-primary/30 hover:text-white transition-all border border-primary/30 active:scale-95 shadow-lg"
                      title="Increase by $1,000"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                  </div>
                </div>
              </div>
              <button className="glass-panel p-4 rounded-xl border border-secondary/20 flex flex-col gap-2 items-center justify-center group hover:bg-secondary/5 transition-colors"
                onClick={() => { setPayExtra(0); setOneTimePayment(0); setRealityShock(false); setStressTest(false); }}>
                <span className="text-[10px] font-label text-secondary uppercase font-bold">Minimum Payments</span>
                <span className="text-[8px] text-secondary/60">Reset to baseline</span>
              </button>
            </div>
          </div>

          <label className="flex items-center gap-4 glass-panel p-4 rounded-xl ghost-border w-fit cursor-pointer">
            <span className="font-label text-sm text-on-surface/80">Include Processing Fee (2%)</span>
            <input type="checkbox" checked={processingFee} onChange={(e) => setProcessingFee(e.target.checked)} className="hidden" />
            <div className={`relative w-12 h-6 rounded-full transition-colors ${processingFee ? 'bg-secondary/40' : 'bg-surface-container-highest'}`}>
              <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${processingFee ? 'translate-x-6 bg-secondary text-secondary shadow-[0_0_10px_currentColor]' : 'bg-outline'}`}></div>
            </div>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-xl ghost-border flex flex-col justify-between h-32 relative overflow-hidden">
              <div className="text-[10px] font-label text-outline uppercase tracking-widest">Monthly EMI</div>
              <div className="text-2xl font-headline font-bold text-white tracking-tighter">{formatCurrency(emi)}</div>
              <div className="absolute top-0 right-0 p-2 opacity-20"><span className="material-symbols-outlined text-4xl">payments</span></div>
            </div>
            <div className={`glass-panel p-6 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden ${realityShock ? 'border-error/50 pulsing-red' : 'border border-error/20'}`}>
              <div className="text-[10px] font-label text-error/80 uppercase tracking-widest">Total Interest</div>
              <div className="text-2xl font-headline font-bold text-error tracking-tighter">{formatCurrency(totalInterest)}</div>
              <div className="absolute top-0 right-0 p-2 opacity-20"><span className="material-symbols-outlined text-4xl">warning</span></div>
            </div>
            <div className={`glass-panel p-6 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden transition-all ${stressTest ? 'border-[#ffb347]/50 shadow-[0_0_30px_rgba(255,179,71,0.2)]' : 'border border-primary/30 shadow-[0_0_30px_rgba(221,183,255,0.15)]'}`}>
              <div className="text-[10px] font-label text-primary uppercase tracking-widest">Total Payable</div>
              <div className="text-2xl font-headline font-bold text-white tracking-tighter">{formatCurrency(totalPayable)}</div>
              <div className="absolute top-0 right-0 p-2 opacity-20"><span className="material-symbols-outlined text-4xl text-primary">auto_graph</span></div>
            </div>
          </div>

          <div className={`flex items-center justify-between p-4 glass-panel rounded-xl border transition-colors cursor-pointer ${stressTest ? 'border-[#ffb347]/50 bg-[#ffb347]/10' : 'border-[#ffb347]/20 bg-[#ffb347]/5'}`} onClick={() => setStressTest(!stressTest)}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ffb347]">tsunami</span>
              <div>
                <div className="text-xs font-bold font-headline text-[#ffb347] uppercase tracking-wider">Stress Test Mode</div>
                <p className="text-[10px] text-on-surface/60">Simulate +2% rate hike & income disruption</p>
              </div>
            </div>
            <div className="relative w-10 h-5 bg-[#ffb347]/20 rounded-full flex items-center px-1">
              <div className={`w-3 h-3 bg-[#ffb347] rounded-full shadow-[0_0_10px_#ffb347] transition-transform ${stressTest ? 'translate-x-5' : ''}`}></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-headline font-bold text-lg text-white/90">Predictive Warnings</h3>
            <div className="space-y-3">
              {riskScore > 40 && (
                <div className="glass-panel p-4 rounded-lg border-l-4 border-error flex items-start gap-4">
                  <span className="material-symbols-outlined text-error mt-0.5">report</span>
                  <div>
                    <div className="text-sm font-bold text-error">Critical: Debt-to-Income Breach</div>
                    <p className="text-xs text-on-surface-variant mt-1">Projected EMI exceeds 40% of assumed ₹5k/mo average income.</p>
                  </div>
                </div>
              )}
              {tenure > 60 && (
                <div className="glass-panel p-4 rounded-lg border-l-4 border-[#ffb347] flex items-start gap-4">
                  <span className="material-symbols-outlined text-[#ffb347] mt-0.5">warning</span>
                  <div>
                    <div className="text-sm font-bold text-[#ffb347]">Moderate: Long-term Interest Buildup</div>
                    <p className="text-xs text-on-surface-variant mt-1">You will be paying interest for over 5 years. Principal reduction will be very slow initially.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Right Side */}
      <section className="w-full md:w-[40%] bg-surface-container-low p-8 md:p-12 flex flex-col relative border-l border-white/5">
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline text-xl font-medium">Cost Over Time</h3>
            <Link href="/" className="px-3 py-1.5 glass-panel rounded-lg border border-white/10 flex items-center gap-2 hover:bg-white/5 text-[10px] font-headline font-bold uppercase tracking-widest transition-all text-on-surface-variant">
               <span className="material-symbols-outlined text-sm">close</span>
               Exit Tool
            </Link>
          </div>

          <div className="flex-1 relative glass-panel rounded-2xl min-h-[400px] ghost-border p-4 overflow-hidden bg-gradient-to-b from-[#131318]/50 to-[#0e0e13]/50">
            <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full animate-pulse pointer-events-none" style={{ animationDuration: '4s' }}></div>
            <ResponsiveContainer width="100%" height="100%" className="relative z-10">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ddb7ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ddb7ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4cd7f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4cd7f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" hide />
                <YAxis hide domain={[0, 'dataMax']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#131318', border: '1px solid rgba(77, 67, 84, 0.4)', borderRadius: '8px' }}
                  itemStyle={{ fontFamily: 'Space Grotesk' }}
                  labelStyle={{ color: '#988d9f' }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                  labelFormatter={(v) => `Month ${v}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalCost" 
                  stroke="#ddb7ff" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorCost)" 
                  activeDot={{ 
                    r: 8, 
                    fill: "#fff", 
                    stroke: "#a855f7", 
                    strokeWidth: 4,
                    style: { filter: 'drop-shadow(0px 0px 15px #ddb7ff)' }
                  }}
                />
                <Area type="monotone" dataKey="principal" stroke="#4cd7f6" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPrincipal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={`mt-12 p-8 glass-panel rounded-2xl border transition-colors cursor-pointer flex items-center justify-between ${realityShock ? 'bg-error/10 border-error/50 shadow-[0_0_20px_rgba(255,180,171,0.2)]' : 'bg-error/5 border-error/30'}`}
               onClick={() => setRealityShock(!realityShock)}>
            <div className="space-y-1">
              <div className="font-headline font-bold text-error tracking-tight text-lg">Reality Shock</div>
              <p className="text-xs text-on-surface-variant max-w-[200px]">Simulate impact of market volatility and late payment penalties.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-12 h-6 bg-error/20 rounded-full flex items-center px-1 transition-colors">
                <div className={`absolute w-4 h-4 bg-error rounded-full shadow-[0_0_15px_#ffb4ab] transition-transform ${realityShock ? 'translate-x-6' : ''}`}></div>
              </div>
              <span className="text-[10px] font-label text-error font-bold tracking-widest uppercase">{realityShock ? 'Active' : 'Off'}</span>
            </div>
          </div>
          
          {realityShock && (
             <div className="mt-4 flex items-start gap-3 text-error px-2 animate-in fade-in slide-in-from-top-4 duration-300">
               <span className="material-symbols-outlined text-sm">error</span>
               <span className="text-[10px] font-label leading-tight">CRITICAL: Simulated 2 default payments applied. Surcharge and extended term logic triggered. Total cost adjusted.</span>
             </div>
          )}
        </div>
      </section>
    </main>
  );
}
