-- PDFLeo production security/performance hardening
-- Applied to project hasdyzmvqwyztssbqvet on 2026-10-10.
-- Safe to re-run; does not delete user data.

-- Keep the SECURITY DEFINER storage quota helper outside the exposed public API schema.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.pdfleo_saved_pdf_quota_ok(p_user_id uuid, p_new_size bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select p_user_id = (select auth.uid())
    and coalesce((
      select sum(coalesce((o.metadata ->> 'size')::bigint, 0))
      from storage.objects o
      where o.bucket_id = 'pdfleo-saved-pdfs'
        and (storage.foldername(o.name))[1] = p_user_id::text
    ), 0) + greatest(coalesce(p_new_size, 0), 0) <= 78643200;
$function$;

revoke all on function private.pdfleo_saved_pdf_quota_ok(uuid,bigint) from public, anon;
grant execute on function private.pdfleo_saved_pdf_quota_ok(uuid,bigint) to authenticated;

drop policy if exists "Users can upload their PDFLeo saved files" on storage.objects;
create policy "Users can upload their PDFLeo saved files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'pdfleo-saved-pdfs'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and private.pdfleo_saved_pdf_quota_ok((select auth.uid()), coalesce((metadata ->> 'size')::bigint, 0))
);

drop function if exists public.pdfleo_saved_pdf_quota_ok(uuid,bigint);

-- Avoid re-evaluating auth.uid() for every profile row.
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Supports the account page's per-user newest-first saved PDF query.
create index if not exists saved_pdfs_user_id_created_at_idx
on public.saved_pdfs (user_id, created_at desc);
