-- Allow public access to insert inquiries (needed for guest applications)
drop policy if exists "Enable insert for users based on user_id" on "public"."inquiries";
drop policy if exists "Enable insert for authenticated users only" on "public"."inquiries";
drop policy if exists "Allow public insert" on "public"."inquiries";

create policy "Allow public insert"
on "public"."inquiries"
as permissive
for insert
to public
with check (true);

-- Ensure shelter can see inquiries for their pets
drop policy if exists "Enable read access for shelters" on "public"."inquiries";
create policy "Enable read access for shelters"
on "public"."inquiries"
as permissive
for select
to public
using (auth.uid() = shelter_id);

-- Ensure applicant can see their own inquiries
drop policy if exists "Enable read access for applicants" on "public"."inquiries";
create policy "Enable read access for applicants"
on "public"."inquiries"
as permissive
for select
to authenticated
using (auth.uid() = applicant_id);
