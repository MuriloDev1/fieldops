create extension if not exists pgcrypto;

create type user_role as enum ('admin', 'supervisor', 'technician');
create type equipment_status as enum ('active', 'maintenance', 'inactive');
create type question_type as enum ('boolean', 'single_choice', 'multi_choice', 'text', 'number', 'photo');
create type assignment_status as enum ('scheduled', 'in_progress', 'completed', 'late', 'cancelled');
create type run_status as enum ('draft', 'submitted', 'approved', 'rejected');
create type severity as enum ('low', 'medium', 'high', 'critical');
create type non_conformity_status as enum ('open', 'in_progress', 'resolved', 'cancelled');
create type corrective_action_status as enum ('open', 'in_progress', 'done', 'cancelled');
create type attachment_owner_type as enum ('inspection_answer', 'non_conformity', 'equipment', 'corrective_action');

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text not null,
  role user_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table sites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  code text,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table equipment_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table equipment (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  site_id uuid not null references sites(id),
  equipment_type_id uuid not null references equipment_types(id),
  responsible_user_id uuid references users(id),
  name text not null,
  code text not null,
  status equipment_status not null default 'active',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table inspection_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  version integer not null default 1,
  published boolean not null default false,
  active boolean not null default true,
  created_by_user_id uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name, version)
);

create table inspection_template_questions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references inspection_templates(id) on delete cascade,
  position integer not null,
  prompt text not null,
  question_type question_type not null,
  required boolean not null default false,
  help_text text,
  validation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (template_id, position)
);

create table inspection_question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references inspection_template_questions(id) on delete cascade,
  position integer not null,
  label text not null,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_id, position),
  unique (question_id, value)
);

create table inspection_assignments (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references inspection_templates(id),
  equipment_id uuid not null references equipment(id),
  assigned_to_user_id uuid not null references users(id),
  assigned_by_user_id uuid references users(id),
  status assignment_status not null default 'scheduled',
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table inspection_runs (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references inspection_assignments(id),
  executed_by_user_id uuid not null references users(id),
  status run_status not null default 'draft',
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  approved_by_user_id uuid references users(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table inspection_answers (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references inspection_runs(id) on delete cascade,
  question_id uuid not null references inspection_template_questions(id),
  value_text text,
  value_number numeric,
  value_boolean boolean,
  value_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, question_id)
);

create table non_conformities (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references equipment(id),
  inspection_run_id uuid references inspection_runs(id),
  answer_id uuid references inspection_answers(id),
  opened_by_user_id uuid references users(id),
  title text not null,
  description text,
  severity severity not null default 'medium',
  status non_conformity_status not null default 'open',
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table corrective_actions (
  id uuid primary key default gen_random_uuid(),
  non_conformity_id uuid not null references non_conformities(id) on delete cascade,
  assigned_to_user_id uuid references users(id),
  title text not null,
  description text,
  status corrective_action_status not null default 'open',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table equipment_status_history (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references equipment(id) on delete cascade,
  old_status equipment_status,
  new_status equipment_status not null,
  changed_by_user_id uuid references users(id),
  reason text,
  changed_at timestamptz not null default now()
);

create table attachments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  owner_type attachment_owner_type not null,
  owner_id uuid not null,
  file_name text not null,
  mime_type text not null,
  storage_url text not null,
  size_bytes bigint,
  uploaded_by_user_id uuid references users(id),
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  actor_user_id uuid references users(id),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index idx_users_organization_role on users (organization_id, role);
create index idx_sites_organization_name on sites (organization_id, name);
create index idx_equipment_organization_status on equipment (organization_id, status);
create index idx_equipment_site on equipment (site_id);
create index idx_equipment_search on equipment using gin (to_tsvector('portuguese', coalesce(name, '') || ' ' || coalesce(code, '')));
create index idx_assignments_user_status_due on inspection_assignments (assigned_to_user_id, status, due_at);
create index idx_assignments_equipment on inspection_assignments (equipment_id);
create index idx_runs_assignment_status on inspection_runs (assignment_id, status);
create index idx_answers_run on inspection_answers (run_id);
create index idx_non_conformities_equipment_status on non_conformities (equipment_id, status);
create index idx_non_conformities_status_severity on non_conformities (status, severity);
create index idx_corrective_actions_status_due on corrective_actions (status, due_at);
create index idx_attachments_owner on attachments (owner_type, owner_id);
create index idx_audit_logs_entity on audit_logs (entity_type, entity_id);

