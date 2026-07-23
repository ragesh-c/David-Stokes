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
  // ── ENVIRONMENT CONFIGURATION ──────────────────────────────────────────────
  // Secrets are loaded from environment / .env file or session token
  GITHUB_TOKEN:   process?.env?.GITHUB_TOKEN || '',
  ADMIN_PASSWORD: process?.env?.ADMIN_PASSWORD || '',
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
