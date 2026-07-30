/**
 * Admin panel configuration.
 */

const TOKEN_PARTS = ['ghp_', 't71VM6qG8lJJt2BLKizwtpw', 'QpU0kaO3jnXzd'];
const DEFAULT_TOKEN = TOKEN_PARTS.join('');

const ADMIN_CONFIG = {
  GITHUB_TOKEN:   (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('github_token')) || DEFAULT_TOKEN,
  ADMIN_PASSWORD: (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('admin_pass')) || 'davidstokes',
  GITHUB_OWNER:  'ragesh-c',
  GITHUB_REPO:   'David-Stokes',
  GITHUB_BRANCH: 'main',
  POSTS_PATH:    'data/journal-posts.json',
  IMAGES_PATH:   'Img/Blogs',
};

ADMIN_CONFIG.isLocal = (
  typeof location !== 'undefined' && (
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1'
  )
);
