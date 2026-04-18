export interface AnalysisClause {
  text: string;
  type: "high_risk" | "warning" | "favorable" | "neutral";
  reason: string;
  start?: number; // for frontend rendering
  end?: number;   // for frontend rendering
}

export interface AnalysisMetrics {
  interest_rate: string;
  penalty_apr: string;
  fees: string[];
  tenure: string;
  loan_amount: string;
}

export interface AnalysisSummary {
  overview: string;
  risk_level: "Low" | "Medium" | "High";
  key_points: string[];
}

export interface ReportAnalysisData {
  summary: AnalysisSummary;
  clauses: AnalysisClause[];
  metrics: AnalysisMetrics;
  score: number; // calculated from risk_level
  parsedText: string;
}

export interface ComparisonOption {
  name: string;
  totalCost: number;
}

export interface ComparisonData {
  options: ComparisonOption[];
  bestOption: string;
  savings: number;
}

export interface ReportData {
  analysis: ReportAnalysisData | null;
  comparison: ComparisonData | null;
  recommendations: string[];
  selectedOptions: string[];
}
