# bb-bk-tk.github.io

Public-safe website and runtime repository for BoRam's intentionally public web pages.

## Repository rule

This repository is **not** a source-of-truth repository for private projects.

Only content that is intentionally public and safe to deliver to a browser belongs here, such as:
- static HTML/CSS/JS used by a live public web page
- public images/media
- intentionally public APK download artifacts while they are distributed this way
- GitHub Pages support files such as `.nojekyll` and `.well-known/`

Do **not** add:
- Android/native source code
- Supabase/other backend source or migrations
- internal setup docs, roadmaps, product specs, or operating notes
- private keys, service-role keys, admin credentials, tokens, or secrets
- project source that already belongs in a private project repository

Private projects must use their own private GitHub repository as the source of truth. If a project needs a public web runtime, only the minimum browser-deliverable output should be published here temporarily until it is moved to its dedicated hosting path.

## Current public pages

- `index.html` — BoRam portfolio
- `binna/` — Binna creator page
- `daehwateum/` — current Daehwateum web runtime
- `fitgive/` — current FitGive web runtime
- `songyeol/` — current SonGyeol web runtime
- `team-boram/` — current Team BoRam browser runtime

The project runtimes above are deployment artifacts, not canonical source repositories.
