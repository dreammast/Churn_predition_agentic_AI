
export type Page = 'single-customer' | 'batch-processing' | 'agent-performance' | 'settings';

export type RiskLevel = "VERY_LOW" | "LOW" | "MEDIUM" | "HIGH";
export type Urgency = "ROUTINE" | "WITHIN_WEEK" | "WITHIN_24_HOURS" | "IMMEDIATE";

export interface CustomerData {
  customerID: string;
  tenure: number;
  MonthlyCharges: number;
  TotalCharges: number;
  Contract: 'Month-to-month' | 'One year' | 'Two year';
  PaymentMethod: 'Electronic check' | 'Mailed check' | 'Bank transfer (automatic)' | 'Credit card (automatic)';
  InternetService: 'DSL' | 'Fiber optic' | 'No';
  OnlineSecurity: 'Yes' | 'No' | 'No internet service';
  TechSupport: 'Yes' | 'No' | 'No internet service';
}

export interface RecommendedAction {
    action: string;
    channel: string;
    priority: "Low" | "Medium" | "High" | "Critical";
}

export interface AgenticResponse {
    churn_probability: number;
    risk_level: RiskLevel;
    urgency: Urgency;
    recommended_actions: RecommendedAction[];
    key_factors: string[];
}