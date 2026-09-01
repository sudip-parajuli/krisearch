-- Lets anyone (including a guest) add themselves or a vendor they know
-- about — vendors previously had no insert policy at all, so the directory
-- could only ever grow via admin/seed scripts. This is the actual long-term
-- source of real vendor coverage the README already promised.

create policy "authenticated insert vendor" on vendors for insert to authenticated
  with check (auth.uid() = profile_id);

create policy "owner updates own vendor listing" on vendors for update to authenticated
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
