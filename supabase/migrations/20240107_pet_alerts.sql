-- Create pet_alerts table
create table if not exists public.pet_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.pet_alerts enable row level security;

-- Policies
create policy "Users can view their own alerts"
  on public.pet_alerts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own alerts"
  on public.pet_alerts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own alerts"
  on public.pet_alerts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own alerts"
  on public.pet_alerts for delete
  using (auth.uid() = user_id);

-- Add triggers for updated_at (optional but good practice)
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on public.pet_alerts
  for each row execute procedure moddatetime (updated_at);
