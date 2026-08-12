create schema if not exists portfolio;

revoke all on schema portfolio from public, anon, authenticated;
grant usage on schema portfolio to postgres, service_role;

create table if not exists portfolio.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  company text check (company is null or char_length(company) <= 160),
  email text not null check (char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 60),
  project_type text not null check (char_length(project_type) <= 80),
  budget text not null check (char_length(budget) <= 80),
  deadline text not null check (char_length(deadline) <= 80),
  description text not null check (char_length(description) between 30 and 5000),
  references text check (references is null or char_length(references) <= 2500),
  source text not null default 'portfolio',
  status text not null default 'new' check (status in ('new','contacted','qualified','won','lost','spam')),
  email_status text not null default 'pending' check (email_status in ('pending','sent','failed')),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists portfolio.rate_limits (
  fingerprint text not null,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_rate_limits_lookup_idx
  on portfolio.rate_limits (fingerprint, created_at desc);

revoke all on all tables in schema portfolio from public, anon, authenticated;
grant select, insert, update, delete on portfolio.leads to service_role;
grant select, insert, delete on portfolio.rate_limits to service_role;

comment on schema portfolio is 'Backend privado do formulário do portfólio. Não exposto ao Data API.';
comment on table portfolio.leads is 'Briefings recebidos pelo formulário /contratar/.';
comment on table portfolio.rate_limits is 'Janela curta de rate limiting; armazena somente fingerprint SHA-256, nunca IP em claro.';
