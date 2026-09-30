begin;

create table public.budget_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 80),
  unique (id, user_id)
);
create unique index budget_accounts_owner_name on public.budget_accounts(user_id, lower(btrim(name)));

create table public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 80),
  unique (id, user_id)
);
create unique index budget_categories_owner_name on public.budget_categories(user_id, lower(btrim(name)));

create table public.budget_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null,
  category_id uuid not null,
  month date not null check (extract(day from month) = 1 and month >= date '2000-01-01' and month <= date '9999-12-01'),
  amount bigint not null check (amount between 1 and 1000000000000),
  created_at timestamptz not null default now(),
  foreign key (account_id, user_id) references public.budget_accounts(id, user_id),
  foreign key (category_id, user_id) references public.budget_categories(id, user_id),
  unique (user_id, month, account_id, category_id)
);
create index budget_allocations_account on public.budget_allocations(account_id, user_id);
create index budget_allocations_category on public.budget_allocations(category_id, user_id);

alter table public.budget_accounts enable row level security;
alter table public.budget_categories enable row level security;
alter table public.budget_allocations enable row level security;

create policy owner_access on public.budget_accounts for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_access on public.budget_categories for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_access on public.budget_allocations for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.budget_accounts, public.budget_categories, public.budget_allocations from anon;
grant select, insert, update, delete on public.budget_accounts, public.budget_categories, public.budget_allocations to authenticated;
commit;
