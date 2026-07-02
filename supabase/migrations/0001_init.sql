-- GIU Intelligence Portal schema. Apply via `supabase db push` or paste into Supabase SQL editor.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create type threat_level as enum ('critical', 'high', 'medium', 'low', 'unknown');
create type org_status as enum ('active', 'dormant', 'dismantled');
create type marker_type as enum ('hq', 'stash', 'meetup', 'incident', 'asset');
create type investigation_status as enum ('active', 'pending', 'closed');
create type operation_status as enum ('planning', 'active', 'completed', 'aborted');
create type mission_status as enum ('planning', 'active', 'completed', 'failed');
create type user_role as enum ('analyst', 'commander', 'admin');
create type activity_type as enum (
  'org_created','org_updated','marker_added','investigation_opened','investigation_closed',
  'operation_started','operation_completed','mission_added','login','threat_escalated'
);
create type activity_entity as enum ('organization','marker','investigation','operation','mission','user');

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text not null default 'Operator',
  rank text not null default 'Analyst',
  avatar_url text,
  role user_role not null default 'analyst',
  created_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id text primary key,
  name text not null,
  alias text,
  description text default '',
  threat_level threat_level not null default 'unknown',
  logo_url text,
  founded_year int,
  members_count int default 0,
  status org_status default 'active',
  primary_color text default '#e6c383',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.territories (
  id text primary key,
  organization_id text not null references public.organizations(id) on delete cascade,
  name text not null,
  points jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.markers (
  id text primary key,
  organization_id text references public.organizations(id) on delete set null,
  label text not null,
  type marker_type not null default 'asset',
  x numeric not null,
  y numeric not null,
  threat_level threat_level not null default 'unknown',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.investigations (
  id text primary key,
  case_number text unique not null,
  title text not null,
  organization_id text references public.organizations(id) on delete set null,
  status investigation_status default 'active',
  priority threat_level default 'medium',
  lead_analyst text not null,
  summary text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  closed_at timestamptz
);

create table if not exists public.operations (
  id text primary key,
  codename text not null,
  organization_id text references public.organizations(id) on delete set null,
  status operation_status default 'planning',
  objective text not null,
  lead_operator text not null,
  participants int default 1,
  planned_at timestamptz,
  executed_at timestamptz,
  summary text default '',
  created_at timestamptz default now()
);

create table if not exists public.missions (
  id text primary key,
  organization_id text not null references public.organizations(id) on delete cascade,
  title text not null,
  description text default '',
  status mission_status default 'planning',
  objective text default '',
  created_at timestamptz default now()
);

create table if not exists public.activity_events (
  id text primary key,
  type activity_type not null,
  actor text not null,
  message text not null,
  entity_type activity_entity not null,
  entity_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_markers_org on public.markers(organization_id);
create index if not exists idx_territories_org on public.territories(organization_id);
create index if not exists idx_investigations_org on public.investigations(organization_id);
create index if not exists idx_operations_org on public.operations(organization_id);
create index if not exists idx_activity_created on public.activity_events(created_at desc);

insert into storage.buckets (id, name, public)
values ('organizations', 'organizations', true)
on conflict (id) do nothing;

-- RLS: authenticated operators can read/write all intelligence data.
alter table public.organizations enable row level security;
alter table public.territories enable row level security;
alter table public.markers enable row level security;
alter table public.investigations enable row level security;
alter table public.operations enable row level security;
alter table public.missions enable row level security;
alter table public.activity_events enable row level security;
alter table public.profiles enable row level security;

create policy "authed read intelligence" on public.organizations for select to authenticated using (true);
create policy "authed write intelligence" on public.organizations for all to authenticated using (true) with check (true);
create policy "authed read intelligence" on public.territories for select to authenticated using (true);
create policy "authed write intelligence" on public.territories for all to authenticated using (true) with check (true);
create policy "authed read intelligence" on public.markers for select to authenticated using (true);
create policy "authed write intelligence" on public.markers for all to authenticated using (true) with check (true);
create policy "authed read intelligence" on public.investigations for select to authenticated using (true);
create policy "authed write intelligence" on public.investigations for all to authenticated using (true) with check (true);
create policy "authed read intelligence" on public.operations for select to authenticated using (true);
create policy "authed write intelligence" on public.operations for all to authenticated using (true) with check (true);
create policy "authed read intelligence" on public.missions for select to authenticated using (true);
create policy "authed write intelligence" on public.missions for all to authenticated using (true) with check (true);
create policy "authed read intelligence" on public.activity_events for select to authenticated using (true);
create policy "authed write intelligence" on public.activity_events for all to authenticated using (true) with check (true);
create policy "authed read profiles" on public.profiles for select to authenticated using (true);
create policy "authed write profiles" on public.profiles for all to authenticated using (true) with check (true);

create policy "authed upload logos" on storage.objects for insert to authenticated with check (bucket_id = 'organizations');
create policy "public read logos" on storage.objects for select using (bucket_id = 'organizations');
create policy "authed update logos" on storage.objects for update to authenticated using (bucket_id = 'organizations');
create policy "authed delete logos" on storage.objects for delete to authenticated using (bucket_id = 'organizations');

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_orgs_updated on public.organizations;
create trigger trg_orgs_updated before update on public.organizations for each row execute function public.set_updated_at();

drop trigger if exists trg_markers_updated on public.markers;
create trigger trg_markers_updated before update on public.markers for each row execute function public.set_updated_at();

drop trigger if exists trg_investigations_updated on public.investigations;
create trigger trg_investigations_updated before update on public.investigations for each row execute function public.set_updated_at();
