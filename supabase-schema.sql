-- PortalKit — Supabase Schema
-- Run this in your Supabase SQL editor

-- Projects
create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  client_name text not null,
  client_email text,
  description text,
  start_date date,
  status text not null default 'in_progress'
    check (status in ('not_started','in_progress','in_review','complete')),
  portal_token text unique not null,
  portal_password text,
  archived boolean default false,
  view_count integer default 0,
  last_viewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Files
create table files (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  name text not null,
  url text not null,
  size_bytes bigint default 0,
  label text,
  uploaded_by text default 'freelancer' check (uploaded_by in ('freelancer','client')),
  created_at timestamptz default now()
);

-- Comments
create table comments (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  author_name text not null,
  author_type text not null check (author_type in ('freelancer','client')),
  body text not null,
  created_at timestamptz default now()
);

-- Invoices
create table invoices (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  line_items jsonb not null default '[]',
  total numeric(10,2) not null default 0,
  currency text not null default 'USD',
  due_date date,
  status text not null default 'unpaid' check (status in ('unpaid','paid','partial')),
  reminders_enabled boolean default true,
  stripe_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz default now(),
  paid_at timestamptz
);

-- Payments
create table payments (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references invoices(id) on delete cascade not null,
  amount numeric(10,2) not null,
  stripe_charge_id text,
  created_at timestamptz default now()
);

-- RLS Policies
alter table projects enable row level security;
alter table files enable row level security;
alter table comments enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;

-- Projects: freelancer owns their projects
create policy "Users manage own projects"
  on projects for all using (auth.uid() = user_id);

-- Projects: anyone can read by portal_token (for client portal)
create policy "Public can read project by token"
  on projects for select using (portal_token is not null);

-- Files: owner can manage; public can read
create policy "Owner manages files"
  on files for all
  using (project_id in (select id from projects where user_id = auth.uid()));

create policy "Public can read files"
  on files for select using (true);

-- Comments: owner can manage; public can insert and read
create policy "Owner manages comments"
  on comments for all
  using (project_id in (select id from projects where user_id = auth.uid()));

create policy "Public can read and insert comments"
  on comments for select using (true);

create policy "Public can insert comments"
  on comments for insert with check (true);

-- Invoices: owner can manage; public can read
create policy "Owner manages invoices"
  on invoices for all
  using (project_id in (select id from projects where user_id = auth.uid()));

create policy "Public can read invoices"
  on invoices for select using (true);

-- Payments: owner can read
create policy "Owner reads payments"
  on payments for select
  using (invoice_id in (
    select i.id from invoices i
    join projects p on p.id = i.project_id
    where p.user_id = auth.uid()
  ));

-- Storage bucket for project files
-- Run in Storage settings or via API:
-- insert into storage.buckets (id, name, public) values ('project-files', 'project-files', true);

-- Updated_at trigger for projects
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();
