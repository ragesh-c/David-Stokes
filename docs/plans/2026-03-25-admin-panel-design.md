# Admin Panel Design — David Stokes Journal CMS
**Date:** 2026-03-25
**Status:** Approved

---

## Goal

Give David a simple web form at `/admin` where he can write and publish journal posts without touching any code. Designed for a non-technical user (60+): email + password login, drag-and-drop image upload, Word-like body editor, one Publish button.

---

## Stack Decision

**Decap CMS** (formerly Netlify CMS) — open-source, runs entirely in the browser, no separate server needed. Pairs natively with Netlify Identity for authentication.

Rejected alternatives:
- Custom GitHub API panel — API token exposed in client-side JS, more to maintain
- Sanity/Contentful — extra third-party account, overkill for one author

---

## How It Works For David

1. Visits `davidstokesauthor.com/admin`
2. Logs in with email + password (Netlify Identity — no GitHub account needed)
3. Clicks **New Post**
4. Fills in form fields (see below)
5. Uploads hero image via drag-and-drop
6. Writes body in a rich-text editor (bold, italic, links, inline images — no HTML)
7. Clicks **Publish**
8. Post is live in ~60 seconds

---

## Data Architecture

Since the site is pure HTML/CSS/JS with no static site generator, posts are stored in a single JSON data file rather than individual markdown files. This avoids needing a build step to process markdown.

```
data/
  journal-posts.json       ← single source of truth for all posts
admin/
  index.html               ← loads Decap CMS
  config.yml               ← defines fields, auth, media folder
journal/
  post.html                ← universal post template (replaces 10 individual files)
```

### `journal-posts.json` structure

```json
[
  {
    "slug": "finding-aethelflad-in-chester",
    "title": "Chester — The Burh Æthelflæd Defended with Bees",
    "date": "2023-04-01",
    "period_label": "Anglo-Saxon History | April 2023",
    "excerpt": "Chester was refounded as a burh in 907 AD...",
    "hero_image": "/Img/Blogs/ChesterBlogPic2b.jpg",
    "hero_image_position": "center 30%",
    "body": "<p>Full HTML body content...</p>"
  }
]
```

---

## CMS Form Fields

| Field | Widget | Notes |
|-------|--------|-------|
| Title | text | Required |
| Slug | string | Auto-generated from title, editable |
| Date | datetime | Defaults to today |
| Period Label | text | e.g. "Anglo-Saxon History \| April 2023" |
| Excerpt | text | Used in journal listing cards |
| Hero Image | image | Uploads to `/Img/Blogs/` |
| Hero Image Position | select | Top / Centre / Bottom |
| Body | markdown (rich text) | WYSIWYG editor |

---

## Authentication

**Local development:** `local_backend: true` in `config.yml` + `npx decap-server` running. No login required. Files written directly to disk.

**Production (Netlify):** Netlify Identity with email + password. One-time setup:
1. Netlify dashboard → Site settings → Identity → Enable
2. Registration → Invite only
3. Invite David's email
4. He sets his password via the email link
5. Done — he can log in at `/admin` forever after

---

## Pages Updated

| File | Change |
|------|--------|
| `journal.html` | JS fetches `data/journal-posts.json`, renders post cards dynamically |
| `journal/post.html` | New universal template — reads `?slug=` from URL, fetches post from JSON, renders body |
| `journal/*.html` (10 files) | Existing posts migrated into JSON; files redirect to `post.html?slug=...` to preserve any existing links |
| `admin/index.html` | New — Decap CMS entry point |
| `admin/config.yml` | New — CMS configuration |
| `data/journal-posts.json` | New — all posts data |

---

## Local Testing

```bash
# Terminal 1 — CMS proxy (writes to local files)
npx decap-server

# Terminal 2 — site server
py -3 -m http.server 8080

# Then open: http://localhost:8080/admin
# No login required in local mode
```

---

## Deployment Checklist (one-time)

- [ ] Push to GitHub (already connected to Netlify/Vercel)
- [ ] Netlify → Enable Identity
- [ ] Netlify → Enable Git Gateway
- [ ] Invite David's email via Identity → Invite users
- [ ] David clicks email link, sets password
- [ ] Test login at `davidstokesauthor.com/admin`
