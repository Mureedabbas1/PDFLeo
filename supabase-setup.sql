-- PDFLeo Supabase setup
-- Run this once in Supabase Dashboard > SQL Editor.
-- This allows the public website to INSERT known tool names only.
-- It does not allow public SELECT, UPDATE, or DELETE access.

grant insert on table public.tool_usage to anon;
grant usage on sequence public.tool_usage_id_seq to anon;

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
