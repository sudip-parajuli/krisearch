-- Storage bucket for post images (pest/disease photos, etc).
-- Public read (images need to display in the feed without a signed URL);
-- authenticated users may only upload into a folder prefixed with their own
-- user id (matches the `${userId}/...` path used by NewPostForm).

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "public read post-images"
on storage.objects for select
using (bucket_id = 'post-images');

create policy "authenticated upload own post-images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "authenticated delete own post-images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
