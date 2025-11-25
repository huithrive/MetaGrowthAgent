
export interface TrafficData {
  monthlyVisits: string;
  bounceRate: string;
  avgDuration: string;
  deviceSplit: string; // e.g., "60% Mobile / 40% Desktop"
}

export interface Competitor {
  name: string;
  url: string;
  strength: string;
  traffic?: TrafficData;
  selected?: boolean;
}

export interface GrowthOption {
  id: string;
  label: string;
  hypothesis: string;
  projectedImpact: number; // 1-100
  requirements: string[];
}

export interface AnalysisResult {
  executiveSummary: string;
  competitors: Competitor[];
  grossOpportunity: string; // e.g. "$12k - $50k / mo" or "High Velocity"
  marketGap: string;
  options: GrowthOption[];
  metaDiagnostic: string;
}

export enum AppStage {
  HERO = 'HERO',
  WAITING_INITIAL = 'WAITING_INITIAL',
  SELECT_COMPETITORS = 'SELECT_COMPETITORS',
  WAITING_SECONDARY = 'WAITING_SECONDARY',
  DASHBOARD = 'DASHBOARD'
}

export interface User {
  email: string;
  name: string;
}
