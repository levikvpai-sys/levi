// Campaign Types
export type CampaignStatus =
  | "draft"
  | "in_progress"
  | "review"
  | "approved"
  | "published";

export type ContentType =
  | "social_post"
  | "video_script"
  | "ad_copy"
  | "email"
  | "blog_post"
  | "image_prompt";

export type Platform =
  | "instagram"
  | "tiktok"
  | "facebook"
  | "email"
  | "youtube"
  | "web";

export type AgentStatus = "idle" | "running" | "completed" | "error";

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  target_audience: string;
  platform: Platform[];
  content_type: ContentType[];
  status: CampaignStatus;
  brief: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  outputs?: CampaignOutput[];
}

export interface CampaignOutput {
  id: string;
  campaign_id: string;
  agent_type: AgentType;
  content_type: ContentType;
  platform?: Platform;
  content: string;
  metadata?: Record<string, unknown>;
  status: "draft" | "approved" | "rejected";
  qa_score?: number;
  qa_feedback?: string;
  created_at: string;
  updated_at: string;
}

// Agent Types
export type AgentType =
  | "product_guardian"
  | "brand_director"
  | "script_studio"
  | "prompt_director"
  | "social_agent"
  | "qa_critic";

export interface AgentConfig {
  id: AgentType;
  name: string;
  role: string;
  description: string;
  icon: string;
  color: string;
  model: string;
  temperature: number;
}

export interface AgentResponse {
  agent: AgentType;
  status: "success" | "error";
  content: string;
  metadata?: Record<string, unknown>;
  tokens_used?: number;
  processing_time_ms?: number;
  error?: string;
}

export interface AgentRun {
  id: string;
  campaign_id: string;
  agent_type: AgentType;
  status: AgentStatus;
  input: Record<string, unknown>;
  output?: AgentResponse;
  started_at?: string;
  completed_at?: string;
  error?: string;
}

// Brand Types
export interface BrandGuideline {
  category: string;
  rules: string[];
  examples?: {
    do: string[];
    dont: string[];
  };
}

export interface ProductInfo {
  name: string;
  type: string;
  description: string;
  benefits: string[];
  price?: string;
  duration?: number;
}

// Script Types
export interface Script {
  id: string;
  campaign_id?: string;
  title: string;
  platform: Platform;
  duration_seconds: number;
  hook: string;
  body: string;
  cta: string;
  full_script: string;
  b_roll_notes?: string;
  music_notes?: string;
  status: "draft" | "approved" | "rejected";
  qa_score?: number;
  created_at: string;
  updated_at: string;
}

// Prompt Types
export interface ImagePrompt {
  id: string;
  campaign_id?: string;
  title: string;
  style: string;
  subject: string;
  environment: string;
  mood: string;
  technical_specs: string;
  full_prompt: string;
  negative_prompt?: string;
  platform?: Platform;
  status: "draft" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

// API Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerateRequest {
  campaign_id?: string;
  brief: string;
  content_type: ContentType;
  platform?: Platform;
  additional_context?: Record<string, unknown>;
}

// Store Types
export interface CampaignStore {
  campaigns: Campaign[];
  currentCampaign: Campaign | null;
  outputs: CampaignOutput[];
  agentRuns: AgentRun[];
  isLoading: boolean;
  error: string | null;
  setCampaigns: (campaigns: Campaign[]) => void;
  setCurrentCampaign: (campaign: Campaign | null) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  addOutput: (output: CampaignOutput) => void;
  updateOutput: (id: string, updates: Partial<CampaignOutput>) => void;
  setAgentRun: (run: AgentRun) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Wizard Types
export interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface CampaignFormData {
  name: string;
  objective: string;
  target_audience: string;
  platforms: Platform[];
  content_types: ContentType[];
  brief: string;
  tone?: string;
  key_messages?: string[];
}

// UI Types
export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}
