"use client";
import React from 'react';
import ReportModal from '@/components/ReportModal';

export default function ReportPage() {
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
      <ReportModal />
    </main>
  );
}
