-- Privacy-conscious analytics for https://bb-bk-tk.github.io/
-- Stores one random browser UUID for approximate unique-browser counts.
-- Stores no cookie ID, email, account ID, user agent, full referrer URL,
-- IP address, fingerprint, or precise location.

create table if not exists public.site_events (
  id bigint generated always as identity primary key,
  event_name text not null
    check (event_name in ('page_view', 'pixel_obby_click')),
  page_path text not null
    check (page_path in ('/', '/binna/')),
  source text not null
    check (source in ('direct', 'internal', 'instagram', 'linkedin', 'other')),
  visitor_id uuid,
  created_at timestamptz not null default now()
);

alter table public.site_events
  add column if not exists visitor_id uuid;

create index if not exists site_events_created_at_idx
  on public.site_events (created_at desc);

create index if not exists site_events_page_event_idx
  on public.site_events (page_path, event_name, created_at desc);

create index if not exists site_events_visitor_idx
  on public.site_events (visitor_id, created_at desc)
  where visitor_id is not null;

create index if not exists site_events_page_event_visitor_idx
  on public.site_events (page_path, event_name, visitor_id, created_at desc)
  where visitor_id is not null;

alter table public.site_events enable row level security;

-- Visitors cannot read, update, delete, or directly insert rows.
revoke all on table public.site_events from public, anon, authenticated;

-- Legacy endpoint retained for cached older clients. It does not populate visitor_id.
create or replace function public.record_site_event(
  p_event_name text,
  p_page_path text,
  p_source text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_event_name is null
     or char_length(p_event_name) > 64
     or p_event_name not in ('page_view', 'pixel_obby_click') then
    raise exception using errcode = '22023', message = 'invalid event_name';
  end if;

  if p_page_path is null
     or char_length(p_page_path) > 128
     or p_page_path not in ('/', '/binna/') then
    raise exception using errcode = '22023', message = 'invalid page_path';
  end if;

  if p_source is null
     or char_length(p_source) > 32
     or p_source not in ('direct', 'internal', 'instagram', 'linkedin', 'other') then
    raise exception using errcode = '22023', message = 'invalid source';
  end if;

  insert into public.site_events (event_name, page_path, source)
  values (p_event_name, p_page_path, p_source);
end;
$$;

revoke all on function public.record_site_event(text, text, text) from public;
grant execute on function public.record_site_event(text, text, text) to anon, authenticated;

-- Current endpoint. visitor_id is a random browser UUID generated client-side.
create or replace function public.record_site_event_v2(
  p_event_name text,
  p_page_path text,
  p_source text,
  p_visitor_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_event_name is null
     or char_length(p_event_name) > 64
     or p_event_name not in ('page_view', 'pixel_obby_click') then
    raise exception using errcode = '22023', message = 'invalid event_name';
  end if;

  if p_page_path is null
     or char_length(p_page_path) > 128
     or p_page_path not in ('/', '/binna/') then
    raise exception using errcode = '22023', message = 'invalid page_path';
  end if;

  if p_source is null
     or char_length(p_source) > 32
     or p_source not in ('direct', 'internal', 'instagram', 'linkedin', 'other') then
    raise exception using errcode = '22023', message = 'invalid source';
  end if;

  if p_visitor_id is null then
    raise exception using errcode = '22023', message = 'invalid visitor_id';
  end if;

  insert into public.site_events (event_name, page_path, source, visitor_id)
  values (p_event_name, p_page_path, p_source, p_visitor_id);
end;
$$;

revoke all on function public.record_site_event_v2(text, text, text, uuid) from public;
grant execute on function public.record_site_event_v2(text, text, text, uuid) to anon, authenticated;

-- These views are for trusted SQL/admin use only. id > 14 excludes the original setup-test events.
create or replace view public.site_analytics_daily
with (security_invoker = true)
as
select
  (created_at at time zone 'Asia/Seoul')::date as day,
  case when page_path = '/' then 'personal'
       when page_path = '/binna/' then 'binna'
       else page_path end as site,
  count(*) filter (where event_name = 'page_view') as page_views,
  count(*) filter (where event_name = 'pixel_obby_click') as pixel_obby_clicks,
  count(*) filter (where source = 'direct') as direct_events,
  count(*) filter (where source = 'internal') as internal_events,
  count(*) filter (where source = 'instagram') as instagram_events,
  count(*) filter (where source = 'linkedin') as linkedin_events,
  count(*) filter (where source = 'other') as other_events,
  count(distinct visitor_id) filter (
    where event_name = 'page_view' and visitor_id is not null
  ) as unique_visitors
from public.site_events
where id > 14
group by 1, 2;

create or replace view public.site_analytics_summary
with (security_invoker = true)
as
select
  case when page_path = '/' then 'personal'
       when page_path = '/binna/' then 'binna'
       else page_path end as site,
  count(*) filter (where event_name = 'page_view') as page_views,
  count(*) filter (where event_name = 'pixel_obby_click') as pixel_obby_clicks,
  case
    when count(*) filter (where event_name = 'page_view') = 0 then null::numeric
    else round(
      100.0 * (count(*) filter (where event_name = 'pixel_obby_click'))::numeric /
      (count(*) filter (where event_name = 'page_view'))::numeric,
      1
    )
  end as pixel_obby_click_rate_pct,
  count(*) filter (where source = 'direct') as direct_events,
  count(*) filter (where source = 'internal') as internal_events,
  count(*) filter (where source = 'instagram') as instagram_events,
  count(*) filter (where source = 'linkedin') as linkedin_events,
  count(*) filter (where source = 'other') as other_events,
  count(distinct visitor_id) filter (
    where event_name = 'page_view' and visitor_id is not null
  ) as unique_visitors,
  min(created_at) filter (
    where event_name = 'page_view' and visitor_id is not null
  ) as unique_tracking_started_at
from public.site_events
where id > 14
group by 1;

revoke all on public.site_analytics_daily from public, anon, authenticated;
revoke all on public.site_analytics_summary from public, anon, authenticated;
