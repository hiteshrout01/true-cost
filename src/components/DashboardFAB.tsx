"use client";
import React, { useState } from 'react';
import AffordabilityModal from './AffordabilityModal';

export default function DashboardFAB() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setModalOpen(true)}
        className="fixed bottom-8 right-8 z-[60] w-16 h-16 rounded-full bg-gradient-to-tr from-secondary to-primary shadow-[0_8px_32px_rgba(76,215,246,0.4)] flex items-center justify-center text-[#2c0051] hover:scale-110 active:scale-95 transition-all group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="material-symbols-outlined text-3xl font-bold">query_stats</span>
      </button>

      <AffordabilityModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
