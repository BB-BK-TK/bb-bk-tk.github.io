# Anonymous site analytics setup

This branch prepares privacy-first analytics for the personal and Binna pages.

## What is recorded

- `page_view` for `/` and `/binna/`
- `pixel_obby_click` when a visitor follows a Pixel Obby link
- Coarse source only: `direct`, `internal`, `instagram`, `linkedin`, or `other`
- Server timestamp

## What is not recorded

No cookies, localStorage identifier, fingerprint, email, account ID, user agent, full referrer URL, precise location, or child information.

## Activation order

1. In Supabase SQL Editor for project `kwsrktcsthksnvgbquup`, run `site-analytics.sql`.
2. Confirm the function exists:
   `select public.record_site_event('page_view', '/', 'direct');`
3. Merge this branch to load `analytics.js` on the personal and Binna pages.
4. Visit both pages once, then query:
   `select page_path, event_name, source, count(*) from public.site_events group by 1,2,3;`

Do not merge before the SQL migration succeeds. The script fails silently if analytics is unavailable, but the intended release gate is database first, pages second.
