/**
 * Admin panel configuration.
 * Fill in GITHUB_TOKEN and ADMIN_PASSWORD before deploying.
 *
 * GITHUB_TOKEN: Personal Access Token with 'repo' scope
 *   → github.com / Settings / Developer settings / Personal access tokens / Tokens (classic)
 *
 * ADMIN_PASSWORD: Simple password David uses to log in to the admin panel
 */

const ADMIN_CONFIG = {
  // ── FILL THESE IN ───────────────────────────────────────────────────────────
  GITHUB_TOKEN:   'PASTE_YOUR_GITHUB_TOKEN_HERE',
  ADMIN_PASSWORD: 'PASTE_YOUR_CHOSEN_PASSWORD_HERE',
  // ────────────────────────────────────────────────────────────────────────────

  // GitHub repo details (already correct for this project)
  GITHUB_OWNER: 'ragesh-c',
  GITHUB_REPO:  'David-Stokes',
  GITHUB_BRANCH:'master',

  // Paths inside the repo
  POSTS_PATH: 'data/journal-posts.json',
  IMAGES_PATH:'Img/Blogs',
};

/**
 * Detect environment:
 *  - localhost → use local Node.js server API
 *  - production → use GitHub API directly
 */
ADMIN_CONFIG.isLocal = (
  location.hostname === 'localhost' ||
  location.hostname === '127.0.0.1'
);
