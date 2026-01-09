-- Migration for Internal Shelter System
-- Adds tables for Medical Records and Internal Pet Details

-- 1. Create Medical Records Table
create table if not exists medical_records (
  id uuid default gen_random_uuid() primary key,
  pet_id uuid references pets(id) on delete cascade not null,
  date date not null default current_date,
  type text not null, -- 'vaccination', 'surgery', 'checkup', 'medication', 'other'
  title text not null, -- e.g. "Rabies Vaccine"
  description text,
  vet_name text,
  clinic_name text,
  weight decimal(5,2), -- Weight in kg
  next_due_date date,
  cost decimal(10,2),
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

-- 2. Add RLS Policies for Medical Records
alter table medical_records enable row level security;

-- Shelters can view/edit records for their own pets
create policy "Shelters can manage medical records for their pets"
  on medical_records
  for all
  to authenticated
  using (
    exists (
      select 1 from pets
      where pets.id = medical_records.pet_id
      and pets.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from pets
      where pets.id = medical_records.pet_id
      and pets.owner_id = auth.uid()
    )
  );

-- 3. Add Internal Fields to Pets table
-- We use safe 'add column if not exists' pattern via DO block or just simple ALTERs that might fail if exist (idempotency preferred)

do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'pets' and column_name = 'internal_id') then
    alter table pets add column internal_id text; -- E.g. "2024-001"
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'pets' and column_name = 'chip_number') then
    alter table pets add column chip_number text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'pets' and column_name = 'passport_number') then
    alter table pets add column passport_number text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'pets' and column_name = 'intake_date') then
    alter table pets add column intake_date date;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'pets' and column_name = 'intake_circumstances') then
    alter table pets add column intake_circumstances text; -- Found, Surrendered, Seized
  end if;
    
  if not exists (select 1 from information_schema.columns where table_name = 'pets' and column_name = 'internal_notes') then
    alter table pets add column internal_notes text;
  end if;
end $$;
