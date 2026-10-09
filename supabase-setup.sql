-- PDFLeo Supabase setup
-- Run this in Supabase Dashboard > SQL Editor.
-- Public website may INSERT known tool names only; no public read/update/delete access.

alter table public.tool_usage enable row level security;

-- Remove unnecessary table/sequence privileges, then grant only what anonymous
-- website analytics needs to insert a row with an identity-generated id.
revoke all privileges on table public.tool_usage from anon, authenticated;
grant insert on table public.tool_usage to anon;

revoke all privileges on sequence public.tool_usage_id_seq from anon, authenticated;
grant usage on sequence public.tool_usage_id_seq to anon;

-- This SECURITY DEFINER function is attached to a database event trigger.
-- It is not meant to be callable by API roles.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

drop policy if exists "Allow public PDFLeo tool usage inserts" on public.tool_usage;

create policy "Allow public PDFLeo tool usage inserts"
on public.tool_usage
for insert
to anon
with check (
  tool_name in (
    'merge','images','rotate','extract','split','remove','compress','optimize',
    'repair','scan','jpgpdf','htmlpdf','pdfjpg','pdfword','pdfexcel','markdown',
    'summary','compare','numbers','watermark','crop','edit','sign','redact',
    'ocr','wordpdf','excelpdf','pptpdf','pdfppt','unlock','protect','forms',
    'pdfa','translate'
  )
);
