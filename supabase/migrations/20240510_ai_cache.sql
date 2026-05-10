create table if not exists ai_cache (
  id uuid primary key default gen_random_uuid(),
  prompt_hash text not null,
  feature text not null,
  response text not null,
  created_at timestamp with time zone default now()
);

create index if not exists ai_cache_prompt_hash_idx on ai_cache (prompt_hash);
