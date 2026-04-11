import Link from 'next/link';
import DataStream from '@/components/DataStream';

export default function Dashboard() {
  return (
    <>
      {/* Hero Section */}
      <main className="relative min-h-screen flex flex-col items-center justify-center pt-[70px] overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 hero-grid pointer-events-none"></div>
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] glow-orb rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-1/4 -left-20 w-[500px] h-[500px] glow-orb rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, #4cd7f6 0%, #4edea3 100%)", opacity: 0.1 }}></div>
        
        <div className="relative z-10 max-w-6xl px-6 text-center">
          <h1 className="font-headline text-6xl md:text-[72px] leading-tight font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-tertiary">
            See the Real Cost.<br/>Not the Marketed One.
          </h1>
          <p className="font-body text-xl md:text-2xl text-on-surface-variant max-w-3xl mx-auto mb-12 font-light leading-relaxed">
            Uncover hidden fees, compare loans, and understand what you're really paying with our proprietary AI-driven financial analysis engine.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/xray" className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-10 py-5 rounded-full font-headline text-lg font-bold flex items-center gap-3 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all transform hover:-translate-y-1">
              Analyze Contract
              <span className="material-symbols-outlined">data_exploration</span>
            </Link>
            <Link href="/calculator" className="glass-panel px-10 py-5 rounded-full font-headline text-lg font-bold flex items-center gap-3 hover:bg-white/10 transition-all transform hover:-translate-y-1">
              Quick Calculator
              <span className="material-symbols-outlined">calculate</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Quick Access Section */}
      <section className="py-24 relative z-10 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: X-Ray */}
          <Link href="/xray" className="glass-panel p-8 rounded-xl group hover:border-secondary/40 transition-all duration-500 cursor-pointer flex flex-col items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 shadow-[0_0_20px_rgba(76,215,246,0.2)]">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>scan</span>
            </div>
            <div>
              <h3 className="font-headline text-2xl font-bold mb-3 text-white">Financial X-Ray</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">Upload any financial document to expose layered fees, predatory interest spikes, and buried exit costs.</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-secondary font-label text-sm uppercase tracking-widest font-bold group-hover:gap-4 transition-all">
              Launch Analysis <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </div>
          </Link>

          {/* Card 2: Calculator */}
          <Link href="/calculator" className="glass-panel p-8 rounded-xl group border-primary/20 hover:border-primary/40 transition-all duration-500 cursor-pointer flex flex-col items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>equalizer</span>
            </div>
            <div>
              <h3 className="font-headline text-2xl font-bold mb-3 text-white">FinSight Calculator</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">Go beyond the monthly payment. See the total lifecycle cost including inflation and opportunity loss.</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-primary font-label text-sm uppercase tracking-widest font-bold group-hover:gap-4 transition-all">
              Open Engine <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </div>
          </Link>

          {/* Card 3: Compare */}
          <Link href="/comparison" className="glass-panel p-8 rounded-xl group hover:border-tertiary/40 transition-all duration-500 cursor-pointer flex flex-col items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary border border-tertiary/20 shadow-[0_0_20px_rgba(78,222,163,0.2)]">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>compare_arrows</span>
            </div>
            <div>
              <h3 className="font-headline text-2xl font-bold mb-3 text-white">Compare Options</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">Simulate multiple financing scenarios side-by-side to find the most efficient capital structure for your goals.</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-tertiary font-label text-sm uppercase tracking-widest font-bold group-hover:gap-4 transition-all">
              Start Matching <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 bg-surface-container-low overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-container via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <span className="font-headline text-5xl md:text-7xl font-extrabold text-secondary drop-shadow-[0_0_15px_rgba(76,215,246,0.4)] mb-4">$1.2B+</span>
              <span className="font-label text-sm uppercase tracking-widest text-outline">Hidden Fees Exposed</span>
              <div className="w-12 h-1 bg-secondary/30 mt-6 rounded-full"></div>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-headline text-5xl md:text-7xl font-extrabold text-primary drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] mb-4">850k</span>
              <span className="font-label text-sm uppercase tracking-widest text-outline">Contracts Analyzed</span>
              <div className="w-12 h-1 bg-primary/30 mt-6 rounded-full"></div>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-headline text-5xl md:text-7xl font-extrabold text-tertiary drop-shadow-[0_0_15px_rgba(78,222,163,0.4)] mb-4">$4.2k</span>
              <span className="font-label text-sm uppercase tracking-widest text-outline">Average Savings Found</span>
              <div className="w-12 h-1 bg-tertiary/30 mt-6 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase / Bento Grid */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
          {/* Big Visualization Card */}
          <div className="md:col-span-8 glass-panel rounded-xl overflow-hidden relative group border-white/5 bg-[#0a0a0d]">
            <div className="absolute inset-0 opacity-60 mix-blend-screen">
              <DataStream />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-10">
              <h4 className="font-headline text-3xl font-bold mb-4">Deep Learning Engine</h4>
              <p className="max-w-md text-on-surface-variant font-body">Our proprietary algorithm scans over 40,000 regulatory data points to spot discrepancies in real-time. No fine print goes unnoticed.</p>
            </div>
            <div className="absolute top-10 right-10 flex gap-2">
              <div className="px-4 py-2 glass-panel rounded-full text-xs font-label text-tertiary flex items-center gap-2 bg-surface/50 border-white/5">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                LIVE SCANNING
              </div>
            </div>
          </div>
          {/* Side Card 1 */}
          <div className="md:col-span-4 glass-panel rounded-xl p-8 flex flex-col justify-between bg-surface-container-high/40 border-white/5">
            <div className="space-y-4">
              <span className="material-symbols-outlined text-4xl text-primary">security</span>
              <h4 className="font-headline text-2xl font-bold leading-tight">Bank-Grade Privacy Protocols</h4>
            </div>
            <p className="text-on-surface-variant text-sm font-body leading-relaxed">Your data is encrypted at the source. We never store raw documents—only the structural patterns analyzed.</p>
          </div>
          {/* Bottom Smaller Cards */}
          <div className="md:col-span-4 glass-panel rounded-xl p-8 flex items-center gap-6 border-white/5">
            <div className="bg-secondary/10 p-4 rounded-full">
              <span className="material-symbols-outlined text-secondary">cloud_done</span>
            </div>
            <div>
              <h5 className="font-headline font-bold">API Access</h5>
              <p className="text-xs text-on-surface-variant">Connect your banking apps directly.</p>
            </div>
          </div>
          <div className="md:col-span-4 glass-panel rounded-xl p-8 flex items-center gap-6 border-white/5">
            <div className="bg-tertiary/10 p-4 rounded-full">
              <span className="material-symbols-outlined text-tertiary">history</span>
            </div>
            <div>
              <h5 className="font-headline font-bold">Audit History</h5>
              <p className="text-xs text-on-surface-variant">Track your financial health over time.</p>
            </div>
          </div>
          <Link href="/xray" className="md:col-span-4 bg-primary text-on-primary rounded-xl p-8 flex items-center justify-center font-headline font-extrabold text-xl cursor-pointer hover:bg-primary-container transition-colors shadow-lg active:scale-[0.98]">
            Get Started Free <span className="material-symbols-outlined ml-2">trending_flat</span>
          </Link>
        </div>
      </section>

      <footer className="py-20 border-t border-outline-variant/10 px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary font-headline tracking-tight">FINSIGHT</span>
            <p className="text-outline text-sm font-body max-w-xs text-center md:text-left">Bringing absolute transparency to a world of complex financial marketing.</p>
          </div>
          <div className="flex gap-12 font-headline text-sm font-medium text-on-surface-variant">
            <a className="hover:text-white transition-colors" href="#">Privacy</a>
            <a className="hover:text-white transition-colors" href="#">Terms</a>
            <a className="hover:text-white transition-colors" href="#">Ethics</a>
            <a className="hover:text-white transition-colors" href="#">Contact</a>
          </div>
        </div>
        <div className="mt-12 text-center text-outline text-[10px] tracking-[0.2em] font-label uppercase">
          © 2026 FINSIGHT ANALYSIS SYSTEMS. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </>
  );
}
