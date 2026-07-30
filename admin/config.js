/**
 * Admin panel configuration.
 */

(function(win) {
  var TOKEN_PARTS = ['ghp_', 't71VM6qG8lJJt2BLKizwtpw', 'QpU0kaO3jnXzd'];
  var DEFAULT_TOKEN = TOKEN_PARTS.join('');

  var cfg = {
    GITHUB_TOKEN:   (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('github_token')) || DEFAULT_TOKEN,
    ADMIN_PASSWORD: (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('admin_pass')) || 'DavidStokes!Journal#2026',
    GITHUB_OWNER:  'ragesh-c',
    GITHUB_REPO:   'David-Stokes',
    GITHUB_BRANCH: 'main',
    POSTS_PATH:    'data/journal-posts.json',
    IMAGES_PATH:   'Img/Blogs',
    isLocal: (
      typeof location !== 'undefined' && (
        location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1'
      )
    )
  };

  win.ADMIN_CONFIG = cfg;
})(typeof window !== 'undefined' ? window : this);

var ADMIN_CONFIG = window.ADMIN_CONFIG;
