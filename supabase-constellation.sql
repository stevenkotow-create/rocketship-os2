-- Shared community constellation · run once in the Supabase SQL editor.
-- Creates two shared tables with "community" row-level security:
-- every authenticated user can READ the whole graph and ADD their own nodes/edges
-- (and delete only their own). This is what makes the constellation collaborative.

create table if not exists public.constellation_nodes (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  kind text not null default 'company',
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.constellation_edges (
  id uuid primary key default gen_random_uuid(),
  source uuid not null references public.constellation_nodes(id) on delete cascade,
  target uuid not null references public.constellation_nodes(id) on delete cascade,
  label text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.constellation_nodes enable row level security;
alter table public.constellation_edges enable row level security;

-- Nodes: read all, insert your own, delete your own
drop policy if exists "cn_read" on public.constellation_nodes;
create policy "cn_read" on public.constellation_nodes for select to authenticated using (true);
drop policy if exists "cn_insert" on public.constellation_nodes;
create policy "cn_insert" on public.constellation_nodes for insert to authenticated with check (auth.uid() = created_by);
drop policy if exists "cn_delete" on public.constellation_nodes;
create policy "cn_delete" on public.constellation_nodes for delete to authenticated using (auth.uid() = created_by);

-- Edges: read all, insert your own, delete your own
drop policy if exists "ce_read" on public.constellation_edges;
create policy "ce_read" on public.constellation_edges for select to authenticated using (true);
drop policy if exists "ce_insert" on public.constellation_edges;
create policy "ce_insert" on public.constellation_edges for insert to authenticated with check (auth.uid() = created_by);
drop policy if exists "ce_delete" on public.constellation_edges;
create policy "ce_delete" on public.constellation_edges for delete to authenticated using (auth.uid() = created_by);
