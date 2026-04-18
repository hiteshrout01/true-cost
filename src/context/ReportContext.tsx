"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { ReportData, ReportAnalysisData, ComparisonData } from "@/types/report";

interface ReportContextType {
  reportData: ReportData;
  setAnalysis: (analysis: ReportAnalysisData) => void;
  setComparison: (comparison: ComparisonData) => void;
  setRecommendations: (recommendations: string[]) => void;
  toggleOption: (optionId: string) => void;
}

const defaultReportData: ReportData = {
  analysis: null,
  comparison: null,
  recommendations: [],
  selectedOptions: ["full_breakdown", "comparison_data", "risk_analysis", "recommendations"],
};

export const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider = ({ children }: { children: ReactNode }) => {
  const [reportData, setReportData] = useState<ReportData>(defaultReportData);

  const setAnalysis = (analysis: ReportAnalysisData) => {
    setReportData((prev) => ({ ...prev, analysis }));
  };

  const setComparison = (comparison: ComparisonData) => {
    setReportData((prev) => ({ ...prev, comparison }));
  };

  const setRecommendations = (recommendations: string[]) => {
    setReportData((prev) => ({ ...prev, recommendations }));
  };

  const toggleOption = (optionId: string) => {
    setReportData((prev) => {
      const isSelected = prev.selectedOptions.includes(optionId);
      if (isSelected) {
        return { ...prev, selectedOptions: prev.selectedOptions.filter((id) => id !== optionId) };
      }
      return { ...prev, selectedOptions: [...prev.selectedOptions, optionId] };
    });
  };

  return (
    <ReportContext.Provider
      value={{ reportData, setAnalysis, setComparison, setRecommendations, toggleOption }}
    >
      {children}
    </ReportContext.Provider>
  );
};

export function useReportData() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error("useReportData must be used within a ReportProvider");
  }
  return context;
}
