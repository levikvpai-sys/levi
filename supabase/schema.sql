-- Hippo Float Brand AI — LEVI Platform
-- Supabase PostgreSQL Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- CAMPAIGNS
-- ============================================================
create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  objective text not null,
  target_audience text,
  platform text[] not null default '{}',
  content_type text[] not null default '{}',
  status text not null default 'draft'
    check (status in ('draft', 'in_progress', 'review', 'approved', 'published')),
  brief text not null,
  product text,
  product_color text,
  style text,
  tone text,
  key_message text,
  user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_campaigns_status on campaigns(status);
create index if not exists idx_campaigns_created_at on campaigns(created_at desc);

-- ============================================================
-- CAMPAIGN OUTPUTS
-- ============================================================
create table if not exists campaign_outputs (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  agent_type text not null
    check (agent_type in ('product_guardian', 'brand_director', 'script_studio', 'prompt_director', 'social_agent', 'qa_critic')),
  content_type text not null
    check (content_type in ('social_post', 'video_script', 'ad_copy', 'email', 'blog_post', 'image_prompt')),
  platform text,
  content text not null,
  metadata jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'rejected')),
  qa_score numeric(3,1),
  qa_feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_campaign_outputs_campaign_id on campaign_outputs(campaign_id);
create index if not exists idx_campaign_outputs_status on campaign_outputs(status);

-- ============================================================
-- SCRIPTS
-- ============================================================
create table if not exists scripts (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete set null,
  title text not null,
  product text not null,
  platform text not null,
  style text not null,
  duration_seconds integer not null default 30,
  hook text not null,
  concept text,
  emotional_arc text,
  beat_sheet text[],
  scenes jsonb not null default '[]',
  dialogue text,
  voiceover text,
  music_direction text,
  visual_intention text,
  cta text,
  hashtags text[],
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'rejected')),
  qa_score numeric(3,1),
  qa_report jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_scripts_campaign_id on scripts(campaign_id);
create index if not exists idx_scripts_product on scripts(product);
create index if not exists idx_scripts_status on scripts(status);

-- ============================================================
-- SHOT PROMPTS
-- ============================================================
create table if not exists shot_prompts (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete set null,
  script_id uuid references scripts(id) on delete set null,
  shot_number integer not null,
  shot_name text,
  shot_type text,
  full_prompt text not null,
  negative_prompt text,
  camera_specs text,
  lighting text,
  motion_notes text,
  continuity_notes text,
  product text not null,
  product_color text,
  generation_tool text,
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'rejected', 'generated')),
  generated_asset_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_shot_prompts_campaign_id on shot_prompts(campaign_id);
create index if not exists idx_shot_prompts_script_id on shot_prompts(script_id);

-- ============================================================
-- CAPTIONS
-- ============================================================
create table if not exists captions (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete set null,
  platform text not null,
  product text not null,
  hook_line text,
  text text not null,
  hashtags text[],
  cta text,
  full_post text not null,
  character_count integer,
  language text not null default 'en',
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'rejected', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_captions_campaign_id on captions(campaign_id);
create index if not exists idx_captions_platform on captions(platform);
create index if not exists idx_captions_status on captions(status);

-- ============================================================
-- AGENT LOGS
-- ============================================================
create table if not exists agent_logs (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  agent_type text not null,
  status text not null check (status in ('idle', 'running', 'completed', 'error')),
  input jsonb,
  output jsonb,
  tokens_used integer,
  processing_time_ms integer,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_agent_logs_campaign_id on agent_logs(campaign_id);
create index if not exists idx_agent_logs_agent_type on agent_logs(agent_type);
create index if not exists idx_agent_logs_created_at on agent_logs(created_at desc);

-- ============================================================
-- APPROVALS
-- ============================================================
create table if not exists approvals (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  output_id uuid,
  output_type text not null check (output_type in ('script', 'prompt', 'caption', 'campaign')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_approvals_campaign_id on approvals(campaign_id);
create index if not exists idx_approvals_status on approvals(status);

-- ============================================================
-- CREATIVE ASSETS
-- ============================================================
create table if not exists creative_assets (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete set null,
  shot_prompt_id uuid references shot_prompts(id) on delete set null,
  asset_type text not null check (asset_type in ('image', 'video', 'audio')),
  url text not null,
  thumbnail_url text,
  product text not null,
  platform text,
  generation_tool text,
  prompt_used text,
  duration_seconds integer,
  dimensions text,
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected', 'published')),
  published_at timestamptz,
  published_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_creative_assets_campaign_id on creative_assets(campaign_id);
create index if not exists idx_creative_assets_status on creative_assets(status);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply triggers
create trigger update_campaigns_updated_at before update on campaigns
  for each row execute function update_updated_at_column();

create trigger update_campaign_outputs_updated_at before update on campaign_outputs
  for each row execute function update_updated_at_column();

create trigger update_scripts_updated_at before update on scripts
  for each row execute function update_updated_at_column();

create trigger update_shot_prompts_updated_at before update on shot_prompts
  for each row execute function update_updated_at_column();

create trigger update_captions_updated_at before update on captions
  for each row execute function update_updated_at_column();
