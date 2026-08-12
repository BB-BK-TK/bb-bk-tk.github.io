-- Privacy-first analytics for https://bb-bk-tk.github.io/
-- Stores no cookie ID, localStorage ID, email, account ID, user agent,
-- full referrer URL, IP address, or precise location.

create table if not exists public.site_events (
  id bigint generated always as identity primary key,
  event_name text not null
    check (event_name in ('page_view', 'pixel_obby_click')),
  page_path text not null
    check (page_path in ('/', '/binna/')),
  source text not null
    check (source in ('direct', 'internal', 'instagram', 'linkedin', 'other')),
  created_at timestamptz not null default now()
);

create index if not exists site_events_created_at_idx
  on public.site_events (created_at desc);

create index if not exists site_events_page_event_idx
  on public.site_events (page_path, event_name, created_at desc);

alter table public.site_events enable row level security;

-- Visitors cannot read, update, delete, or directly insert rows.
revoke all on table public.site_events from public, anon, authenticated;

create or replace function public.record_site_event(
  p_event_name text,
  p_page_path text,
  p_source text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_event_name not in ('page_view', 'pixel_obby_click') then
    raise exception 'invalid event';
  end if;

  if p_page_path not in ('/', '/binna/') then
    raise exception 'invalid page';
  end if;

  if p_source not in ('direct', 'internal', 'instagram', 'linkedin', 'other') then
    raise exception 'invalid source';
  end if;

  insert into public.site_events (event_name, page_path, source)
  values (p_event_name, p_page_path, p_source);
end;
$$;

revoke all on function public.record_site_event(text, text, text) from public;
grant execute on function public.record_site_event(text, text, text) to anon, authenticated;

-- Read analytics only inside the authenticated Supabase SQL editor.
-- Example:
-- select date(created_at) as day, page_path, event_name, source, count(*) as events
-- from public.site_events
-- group by 1, 2, 3, 4
-- order by day desc, page_path, event_name, source;
