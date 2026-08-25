# Team BoRam Control Tower — setup

This branch adds a mobile-first `/team-boram/` dashboard and a Supabase Edge Function that reads/writes the Team BoRam Notion data sources.

## Architecture

`GitHub Pages /team-boram/` → `Supabase Edge Function team-boram-api` → `Notion API`

The Notion secret is never exposed to browser JavaScript.

## 1. Create a Notion internal integration

Create an internal Notion integration with read + update content capability. Share both of these Notion databases with that integration:

- Team BoRam v1 — Project Portfolio
- Team BoRam — Live Work

The function defaults to the current data source IDs already used by Team BoRam:

- Portfolio: `0724ff88-9efb-4852-a782-4aeb87555e3e`
- Live Work: `3e18fc30-88d9-4b7a-b0aa-00ff4055f66c`

## 2. Configure Supabase secrets

The frontend is already pointed at the existing project:

`https://kacvynoegfpvgdpqtjdi.supabase.co/functions/v1/team-boram-api`

Set secrets from a trusted shell. Do not commit them.

```bash
supabase secrets set \
  NOTION_TOKEN='secret_xxx' \
  TEAM_BORAM_DASHBOARD_KEY='choose-a-long-random-key' \
  TEAM_BORAM_ALLOWED_ORIGINS='https://bb-bk-tk.github.io'
```

Optional overrides:

```bash
supabase secrets set \
  NOTION_LIVE_WORK_DS='3e18fc30-88d9-4b7a-b0aa-00ff4055f66c' \
  NOTION_PORTFOLIO_DS='0724ff88-9efb-4852-a782-4aeb87555e3e'
```

## 3. Deploy the Edge Function

```bash
supabase functions deploy team-boram-api --no-verify-jwt
```

`supabase/config.toml` also declares `verify_jwt = false`. Access is protected by `X-Dashboard-Key` and the allowed-origin check instead of Supabase JWT auth.

## 4. Test before merging

Run the GitHub Pages frontend locally from the repo root:

```bash
python3 -m http.server 8000
```

Temporarily include `http://localhost:8000` in `TEAM_BORAM_ALLOWED_ORIGINS` while testing, then open:

`http://localhost:8000/team-boram/`

Test these flows:

1. Enter the dashboard key.
2. Confirm agents and Live Work are loaded from Notion.
3. Confirm Founder Queue only shows `Needs BoRam` / `Waiting for BoRam` items without a resolved Founder Decision.
4. Save a harmless test decision on a test Live Work item and confirm Notion updates `Founder Decision`, `Decision Note`, and `Decision Updated`.
5. Confirm `Save & unlock agent` moves the item to `Execution Mode=Autonomous` and `Status=In progress`.
6. Confirm `Park` sets `Execution Mode=Parked`.

## 5. Production URL after merge

`https://bb-bk-tk.github.io/team-boram/`

The page itself is public static HTML, but it does not reveal Notion data without the dashboard key. The Notion integration token stays only in Supabase secrets.

## Security notes

- Never put `NOTION_TOKEN` in `config.js`, HTML, GitHub Actions logs, or the public repository.
- `TEAM_BORAM_DASHBOARD_KEY` is stored only in `sessionStorage` in the browser, so it clears when the tab/session is closed.
- This is a pragmatic v1. A stronger v2 should replace the shared key with Supabase Auth / passkey login and user-specific authorization.
- Keep the dashboard focused on Team BoRam personal projects; do not expose Samsung/company-internal material through this app.
