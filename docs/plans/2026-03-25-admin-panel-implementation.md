# Admin Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `/admin` page powered by Decap CMS so David can write and publish journal posts via a simple web form with no coding required.

**Architecture:** Decap CMS runs in the browser at `/admin`, authenticated via Netlify Identity (email + password). New posts are stored as entries in `data/journal-posts.json`. A universal template `journal/post.html` renders any post by reading `?slug=` from the URL and fetching the JSON. The existing 10 HTML posts are left untouched. `journal.html` is updated to prepend JSON-powered posts above the existing hardcoded cards.

**Tech Stack:** Decap CMS (CDN), Netlify Identity Widget (CDN), marked.js (CDN for markdown rendering), vanilla JS, Python http.server for local dev, `npx decap-server` for local CMS proxy.

---

## Task 1: Create the posts data file

**Files:**
- Create: `data/journal-posts.json`

**Step 1: Create the data directory and empty posts file**

Create `data/journal-posts.json` with an empty array:

```json
[]
```

**Step 2: Verify the file exists and is valid JSON**

Open `http://localhost:8080/data/journal-posts.json` in the browser.
Expected: `[]` displayed in the browser.

**Step 3: Commit**

```bash
git add data/journal-posts.json
git commit -m "feat: add journal posts data file"
```

---

## Task 2: Create the Decap CMS admin panel

**Files:**
- Create: `admin/index.html`
- Create: `admin/config.yml`

**Step 1: Create `admin/index.html`**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Journal Admin — David Stokes</title>
</head>
<body>
  <!-- Netlify Identity Widget -->
  <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
  <!-- Decap CMS -->
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
</body>
</html>
```

**Step 2: Create `admin/config.yml`**

```yaml
# Switch between local dev and production automatically
local_backend: true

backend:
  name: git-gateway
  branch: master

# Where uploaded images are stored
media_folder: "Img/Blogs"
public_folder: "/Img/Blogs"

collections:
  - name: "journal"
    label: "Journal Posts"
    label_singular: "Journal Post"
    folder: "data"
    # Single file collection — all posts in one JSON array
    # We use a files collection instead to manage the single JSON file
    files:
      - name: "posts"
        label: "All Posts"
        file: "data/journal-posts.json"
        fields:
          - name: posts
            label: Posts
            label_singular: Post
            widget: list
            summary: "{{fields.title}}"
            fields:
              - { name: slug,             label: "URL Slug",      widget: string,   hint: "URL-safe identifier, e.g. my-post-title (auto-fill from title)" }
              - { name: title,            label: "Title",         widget: string }
              - { name: date,             label: "Date",          widget: datetime, date_format: "YYYY-MM-DD", time_format: false, default: "" }
              - { name: period_label,     label: "Period Label",  widget: string,   hint: "e.g. Anglo-Saxon History | April 2023" }
              - { name: excerpt,          label: "Excerpt",       widget: text,     hint: "Short summary shown on the journal listing page" }
              - { name: hero_image,       label: "Hero Image",    widget: image }
              - name: hero_image_position
                label: "Hero Image Focus"
                widget: select
                options:
                  - { label: "Top",    value: "center top" }
                  - { label: "Centre", value: "center center" }
                  - { label: "Bottom", value: "center bottom" }
                default: "center center"
              - { name: body,             label: "Body",          widget: markdown }
```

**Step 3: Verify the admin panel loads locally**

In a separate terminal run:
```bash
npx decap-server
```

Then open `http://localhost:8080/admin/`
Expected: Decap CMS dashboard loads, shows "Journal Posts" in the sidebar. No login required in local mode.

**Step 4: Commit**

```bash
git add admin/index.html admin/config.yml
git commit -m "feat: add Decap CMS admin panel config"
```

---

## Task 3: Create a test post via the admin panel

**Files:**
- Modified automatically: `data/journal-posts.json`

**Step 1: Open the admin panel**

`http://localhost:8080/admin/` (with `npx decap-server` running)

**Step 2: Create a test post**

- Click "Journal Posts" → "All Posts"
- Click the "+" button to add a new item in the list
- Fill in:
  - Slug: `test-post`
  - Title: `Test Post`
  - Date: today
  - Period Label: `Anglo-Saxon History | March 2026`
  - Excerpt: `A test post to verify the admin panel works.`
  - Hero Image: upload any image from `Img/Blogs/`
  - Body: write a short paragraph
- Click **Publish**

**Step 3: Verify the JSON was written**

Open `data/journal-posts.json` in a text editor.
Expected: The array now contains one object with all the fields filled in.

**Step 4: Delete the test post**

Remove the test entry from the JSON (or delete it via the admin panel). We don't want dummy data in the site.

---

## Task 4: Create the universal post template

**Files:**
- Create: `journal/post.html`

This page reads `?slug=xxx` from the URL, finds the matching post in `data/journal-posts.json`, and renders it. Uses `marked.js` to convert markdown body to HTML.

**Step 1: Create `journal/post.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Journal — David Stokes</title>
  <meta name="description" content="">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&family=Libre+Caslon+Display&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Raleway:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/reset.css">
  <link rel="stylesheet" href="../css/styles.css">
</head>
<body class="journal">

  <a href="#main" class="skip-nav">Skip to main content</a>

  <nav class="site-nav" aria-label="Main navigation">
    <a href="../index.html" class="nav-wordmark">David Stokes</a>
    <ul class="nav-links" role="list">
      <li><a href="../books.html">Books</a></li>
      <li><a href="../about.html">About</a></li>
      <li><a href="../media.html">Media</a></li>
      <li><a href="../journal.html" aria-current="page">Journal</a></li>
      <li><a href="../contact.html">Contact</a></li>
    </ul>
    <button class="nav-hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>
  </nav>

  <div class="mobile-nav-overlay" id="mobile-nav" role="dialog" aria-modal="true" aria-label="Mobile navigation">
    <button class="mobile-nav-close" aria-label="Close menu">&#x2715;</button>
    <ul class="nav-links" role="list">
      <li><a href="../books.html">Books</a></li>
      <li><a href="../about.html">About</a></li>
      <li><a href="../media.html">Media</a></li>
      <li><a href="../journal.html">Journal</a></li>
      <li><a href="../contact.html">Contact</a></li>
    </ul>
  </div>

  <main id="main">

    <!-- PAGE HERO — populated by JS -->
    <section class="section page-hero journal-post-hero" id="post-hero">
      <img class="journal-post-hero-bg" id="post-hero-img" src="" alt="" aria-hidden="true">
      <div class="container" style="max-width:var(--max-body-width); margin-inline:auto; padding-inline:var(--side-margin-mobile);">
        <span class="period-label" id="post-period-label"></span>
        <h1 id="post-title"></h1>
      </div>
    </section>

    <!-- ARTICLE BODY — populated by JS -->
    <div class="section" style="padding-top:0;">
      <div class="container article-body" id="post-body"></div>
    </div>

    <!-- BACK LINK -->
    <div class="section bg-secondary" style="padding-block:3rem;">
      <div class="container" style="max-width:var(--max-body-width);">
        <a href="../journal.html" style="color:var(--accent-burg); font-size:0.875rem; font-weight:500; letter-spacing:0.05em; text-transform:uppercase; text-decoration:none;">← Back to Journal</a>
      </div>
    </div>

  </main>

  <footer class="site-footer">
    <div class="footer-grid">
      <div>
        <span class="footer-wordmark">David Stokes</span>
        <p class="footer-tagline">"The women history tried to erase. Restored."</p>
      </div>
      <div>
        <p class="footer-section-label">Quick Links</p>
        <ul class="footer-links" role="list">
          <li><a href="../books.html">Books</a></li>
          <li><a href="../about.html">About</a></li>
          <li><a href="../media.html">Media</a></li>
          <li><a href="../journal.html">Journal</a></li>
          <li><a href="../contact.html">Contact</a></li>
        </ul>
      </div>
    </div>
    <p class="footer-legal">&copy; 2024 David Stokes. All rights reserved.</p>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="../js/main.js"></script>
  <script>
    (async function () {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get('slug');

      if (!slug) {
        document.getElementById('post-title').textContent = 'Post not found';
        return;
      }

      try {
        const res = await fetch('../data/journal-posts.json');
        const posts = await res.json();
        const post = posts.find(p => p.slug === slug);

        if (!post) {
          document.getElementById('post-title').textContent = 'Post not found';
          return;
        }

        // Update page title and meta
        document.title = post.title + ' — David Stokes Journal';

        // Hero
        const heroImg = document.getElementById('post-hero-img');
        heroImg.src = post.hero_image;
        heroImg.alt = post.title;
        heroImg.style.objectPosition = post.hero_image_position || 'center center';

        document.getElementById('post-period-label').textContent = post.period_label;
        document.getElementById('post-title').textContent = post.title;

        // Body — render markdown to HTML
        document.getElementById('post-body').innerHTML = marked.parse(post.body || '');

      } catch (err) {
        document.getElementById('post-title').textContent = 'Error loading post';
        console.error(err);
      }
    })();
  </script>

</body>
</html>
```

**Step 2: Verify the template works**

Create a quick test entry directly in `data/journal-posts.json`:

```json
[
  {
    "slug": "test-post",
    "title": "Test Post",
    "date": "2026-03-25",
    "period_label": "Anglo-Saxon History | March 2026",
    "excerpt": "A test post.",
    "hero_image": "/Img/Blogs/ChesterBlogPic2b.jpg",
    "hero_image_position": "center center",
    "body": "## Hello\n\nThis is a **test** post with _markdown_ content.\n\nAnother paragraph here."
  }
]
```

Open `http://localhost:8080/journal/post.html?slug=test-post`
Expected: Page renders with the hero image, title, period label, and formatted body text.

**Step 3: Remove test entry from JSON**

Reset `data/journal-posts.json` back to `[]`.

**Step 4: Commit**

```bash
git add journal/post.html data/journal-posts.json
git commit -m "feat: add universal journal post template"
```

---

## Task 5: Update journal.html to render posts from JSON

**Files:**
- Modify: `journal.html`

New posts from the admin panel should appear at the **top** of the journal listing, above the existing hardcoded cards.

**Step 1: Find the journal listing section in `journal.html`**

Look for the section containing hardcoded `journal-card` elements.

**Step 2: Add a container for dynamic posts at the top of the grid**

Immediately before the first hardcoded `.journal-card`, add:

```html
<!-- DYNAMIC POSTS — loaded from data/journal-posts.json -->
<div id="dynamic-posts"></div>
```

**Step 3: Add the fetch script before `</body>`**

```html
<script>
  (async function () {
    try {
      const res = await fetch('data/journal-posts.json');
      const posts = await res.json();
      if (!posts.length) return;

      const container = document.getElementById('dynamic-posts');

      // Sort newest first
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));

      posts.forEach(post => {
        const card = document.createElement('a');
        card.href = 'journal/post.html?slug=' + encodeURIComponent(post.slug);
        card.className = 'journal-card reveal';
        card.style.textDecoration = 'none';
        card.style.color = 'inherit';
        card.style.display = 'block';

        card.innerHTML = `
          <div class="journal-card-image">
            <img src="${post.hero_image}" alt="${post.title}" style="object-position: ${post.hero_image_position || 'center center'}">
          </div>
          <span class="period-label" style="display:inline-block; margin-top:1rem;">${post.period_label}</span>
          <h3 class="journal-card-title">${post.title}</h3>
          <p class="journal-card-excerpt">${post.excerpt}</p>
        `;
        container.appendChild(card);
      });
    } catch (err) {
      console.error('Could not load posts:', err);
    }
  })();
</script>
```

**Step 4: Verify the journal page still works with no JSON posts**

Open `http://localhost:8080/journal.html`
Expected: Page looks exactly as before (existing hardcoded cards visible, no errors in console).

**Step 5: Add a test entry to the JSON and verify it appears**

Add one entry to `data/journal-posts.json`, reload `journal.html`.
Expected: The new card appears at the top of the grid.

**Step 6: Remove test entry, commit**

```bash
git add journal.html data/journal-posts.json
git commit -m "feat: render dynamic posts from JSON on journal listing"
```

---

## Task 6: End-to-end local test

**Step 1: Start both servers**

Terminal 1:
```bash
npx decap-server
```

Terminal 2:
```bash
cd "e:\Claude stuff\david-stokes-website"
py -3 -m http.server 8080
```

**Step 2: Create a real post via the admin panel**

Open `http://localhost:8080/admin/`
- Click "Journal Posts" → "All Posts"
- Click "+" to add a post
- Fill in all fields, upload a real image from `Img/Blogs/`
- Write a few paragraphs of body text using the rich text toolbar
- Click **Publish**

**Step 3: Verify the post appears on journal.html**

Open `http://localhost:8080/journal.html`
Expected: New post card appears at the top.

**Step 4: Verify the post page renders correctly**

Click the card.
Expected: `journal/post.html?slug=your-slug` loads with correct hero image, title, period label, and formatted body.

**Step 5: Delete the test post via admin, commit clean state**

```bash
git add data/journal-posts.json
git commit -m "chore: clean up test posts after local verification"
```

---

## Task 7: Push and final commit

```bash
git add .
git commit -m "feat: Decap CMS admin panel for journal posts

David can now publish journal posts at /admin with email + password login.
Posts stored in data/journal-posts.json, rendered via journal/post.html.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

git push origin master
```

---

## Post-deployment setup (one-time, done by developer on Netlify)

1. Netlify dashboard → **Site configuration** → **Identity** → **Enable Identity**
2. Identity → **Registration** → set to **Invite only**
3. Identity → **Services** → **Git Gateway** → **Enable Git Gateway**
4. Identity → **Invite users** → enter David's email
5. David receives email, clicks link, sets his password
6. Done — David logs in at `davidstokesauthor.com/admin`

> **Note:** Before deploying, change `local_backend: true` to `local_backend: false` in `admin/config.yml`, or remove the line entirely (it defaults to false in production).
