// API service layer for connecting to FastAPI backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface RefreshRequest {
  priority?: boolean;
}

export interface Competitor {
  name: string;
  url: string;
  strength: string;
  traffic?: {
    monthlyVisits: string;
    bounceRate: string;
    avgDuration: string;
    deviceSplit: string;
  };
}

export interface GrowthOption {
  id: string;
  label: string;
  hypothesis: string;
  projectedImpact: number;
  requirements: string[];
}

export interface AnalysisResult {
  executiveSummary: string;
  competitors: Competitor[];
  grossOpportunity: string;
  marketGap: string;
  options: GrowthOption[];
  metaDiagnostic: string;
}

export interface ReportResponse {
  report: {
    account_id: string;
    timeframe: string;
    meta: Record<string, any>;
    competitor: Record<string, any>;
    insight: {
      summary: string;
      recommendations: string[];
      anomalies: Array<Record<string, any>>;
      llm_provider: string;
    };
    artifacts_path?: string;
    created_at: string;
  };
}

export interface AlertResponse {
  id: number;
  account_id: string;
  alert_type: string;
  severity: string;
  message: string;
  metadata: Record<string, any>;
  created_at: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Unauthorized - please login again');
        }
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      // Handle network errors (backend not available, CORS, etc.)
      if (error.message?.includes('Failed to fetch') || 
          error.message?.includes('NetworkError') ||
          error.name === 'TypeError') {
        throw new Error('Backend not available - using demo mode');
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.access_token);
    return response;
  }

  // Reports endpoints
  async getReport(accountId: string): Promise<ReportResponse> {
    return this.request<ReportResponse>(`/reports/${accountId}`);
  }

  async refreshReport(accountId: string, priority: boolean = false): Promise<{ status: string }> {
    return this.request<{ status: string }>(`/reports/${accountId}/refresh`, {
      method: 'POST',
      body: JSON.stringify({ priority }),
    });
  }

  // Alerts endpoints
  async getAlerts(): Promise<AlertResponse[]> {
    return this.request<AlertResponse[]>('/alerts');
  }

  // Health check
  async healthCheck(): Promise<{ status: string; environment: string }> {
    return this.request<{ status: string; environment: string }>('/health');
  }

  // Transform backend report to frontend AnalysisResult format
  transformReportToAnalysis(report: ReportResponse['report'], websiteUrl: string): AnalysisResult {
    const insight = report.insight;
    const competitor = report.competitor || {};
    const meta = report.meta || {};

    // Transform competitors from backend format
    const competitors: Competitor[] = Object.entries(competitor).map(([key, value]: [string, any]) => ({
      name: value.name || key,
      url: value.url || key,
      strength: value.strength || 'Analysis pending',
      traffic: value.traffic ? {
        monthlyVisits: value.traffic.monthlyVisits || 'N/A',
        bounceRate: value.traffic.bounceRate || 'N/A',
        avgDuration: value.traffic.avgDuration || 'N/A',
        deviceSplit: value.traffic.deviceSplit || 'N/A',
      } : undefined,
    }));

    // Transform recommendations to growth options
    const options: GrowthOption[] = insight.recommendations.map((rec, idx) => {
      // Try to parse structured recommendation or create default
      const parts = rec.split(':');
      return {
        id: `opt-${idx}`,
        label: parts[0] || 'Growth Strategy',
        hypothesis: parts[1] || rec,
        projectedImpact: 75 + (idx * 5), // Default impact
        requirements: ['Meta Ads Account', 'Campaign Access'],
      };
    });

    return {
      executiveSummary: insight.summary || 'Analysis complete.',
      competitors: competitors.length > 0 ? competitors : [
        { name: 'Market Leader', url: 'competitor.com', strength: 'High frequency ads' },
      ],
      grossOpportunity: meta.grossOpportunity || '$10k - $50k / mo',
      marketGap: meta.marketGap || 'High CPM detected',
      options: options.length > 0 ? options : [
        {
          id: 'opt-1',
          label: 'Optimize Creative Strategy',
          hypothesis: 'Implement high-velocity video creatives to reduce bounce rate',
          projectedImpact: 85,
          requirements: ['Video Assets', 'A/B Testing'],
        },
      ],
      metaDiagnostic: meta.diagnostic || insight.summary || 'Connection pending',
    };
  }
}

export const apiService = new ApiService();
export default apiService;

