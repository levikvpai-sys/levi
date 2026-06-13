import { createClient } from "@supabase/supabase-js";
import type { Campaign, CampaignOutput, AgentRun } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Database helper functions

export async function getCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching campaigns:", error);
    return [];
  }
  return data || [];
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from("campaigns")
    .select(
      `
      *,
      outputs:campaign_outputs(*)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching campaign:", error);
    return null;
  }
  return data;
}

export async function createCampaign(
  campaign: Omit<Campaign, "id" | "created_at" | "updated_at">
): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from("campaigns")
    .insert([
      {
        ...campaign,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating campaign:", error);
    return null;
  }
  return data;
}

export async function updateCampaign(
  id: string,
  updates: Partial<Campaign>
): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from("campaigns")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating campaign:", error);
    return null;
  }
  return data;
}

export async function deleteCampaign(id: string): Promise<boolean> {
  const { error } = await supabase.from("campaigns").delete().eq("id", id);

  if (error) {
    console.error("Error deleting campaign:", error);
    return false;
  }
  return true;
}

export async function getCampaignOutputs(
  campaignId: string
): Promise<CampaignOutput[]> {
  const { data, error } = await supabase
    .from("campaign_outputs")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching campaign outputs:", error);
    return [];
  }
  return data || [];
}

export async function createCampaignOutput(
  output: Omit<CampaignOutput, "id" | "created_at" | "updated_at">
): Promise<CampaignOutput | null> {
  const { data, error } = await supabase
    .from("campaign_outputs")
    .insert([
      {
        ...output,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating campaign output:", error);
    return null;
  }
  return data;
}

export async function updateCampaignOutput(
  id: string,
  updates: Partial<CampaignOutput>
): Promise<CampaignOutput | null> {
  const { data, error } = await supabase
    .from("campaign_outputs")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating campaign output:", error);
    return null;
  }
  return data;
}

export async function createAgentRun(
  run: Omit<AgentRun, "id">
): Promise<AgentRun | null> {
  const { data, error } = await supabase
    .from("agent_runs")
    .insert([{ ...run, id: crypto.randomUUID() }])
    .select()
    .single();

  if (error) {
    console.error("Error creating agent run:", error);
    return null;
  }
  return data;
}

export async function updateAgentRun(
  id: string,
  updates: Partial<AgentRun>
): Promise<AgentRun | null> {
  const { data, error } = await supabase
    .from("agent_runs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating agent run:", error);
    return null;
  }
  return data;
}
