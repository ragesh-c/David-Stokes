/**
 * GitHub API helpers — used by the admin panel in production.
 * On localhost these are bypassed in favour of the local Node.js server.
 */

const GitHubAPI = (() => {
  function headers() {
    const token = ADMIN_CONFIG.GITHUB_TOKEN || sessionStorage.getItem('github_token') || '';
    return {
      'Authorization': 'token ' + token,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  function apiUrl(path) {
    return `https://api.github.com/repos/${ADMIN_CONFIG.GITHUB_OWNER}/${ADMIN_CONFIG.GITHUB_REPO}/contents/${path}`;
  }

  function b64ToUtf8(str) {
    const binary = atob(str.replace(/\s/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  function utf8ToB64(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // ── Read a file (returns { content (decoded), sha }) ────────────────────────
  async function getFile(repoPath) {
    const res  = await fetch(apiUrl(repoPath) + '?ref=' + ADMIN_CONFIG.GITHUB_BRANCH, { headers: headers() });
    if (!res.ok) throw new Error('Could not read ' + repoPath + ' (' + res.status + ')');
    const data = await res.json();
    return {
      content: JSON.parse(b64ToUtf8(data.content)),
      sha:     data.sha,
    };
  }

  // ── Write a file (creates or updates) ──────────────────────────────────────
  async function putFile(repoPath, jsonContent, sha, commitMessage) {
    const body = {
      message: commitMessage || 'Admin: update ' + repoPath,
      branch:  ADMIN_CONFIG.GITHUB_BRANCH,
      content: utf8ToB64(JSON.stringify(jsonContent, null, 2)),
    };
    if (sha) body.sha = sha;
    const res = await fetch(apiUrl(repoPath), {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'GitHub write failed (' + res.status + ')');
    }
    return res.json();
  }

  // ── Upload an image (base64 encode and commit) ──────────────────────────────
  async function uploadImage(file) {
    const filename  = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const repoPath  = ADMIN_CONFIG.IMAGES_PATH + '/' + filename;
    const base64    = await fileToBase64(file);

    const body = {
      message: 'Admin: upload image ' + filename,
      branch:  ADMIN_CONFIG.GITHUB_BRANCH,
      content: base64,
    };
    const res = await fetch(apiUrl(repoPath), {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Image upload failed (' + res.status + ')');
    }
    return '/' + repoPath;
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ── Public interface ────────────────────────────────────────────────────────

  // Load all posts
  async function loadPosts() {
    if (ADMIN_CONFIG.isLocal) {
      const res = await fetch('/api/posts.php');
      if (!res.ok) {
        const res2 = await fetch('/api/posts');
        return res2.json();
      }
      return res.json();
    }

    // 1. Try PHP server API first
    try {
      const res = await fetch('/api/posts.php');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.posts)) return data;
      }
    } catch (_) {}

    // 2. Try static JSON file on domain
    try {
      const res = await fetch('/data/journal-posts.json?v=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.posts)) return data;
      }
    } catch (_) {}

    // 3. Fall back to GitHub API
    const { content, sha } = await getFile(ADMIN_CONFIG.POSTS_PATH);
    GitHubAPI._postsSha = sha;
    return content;
  }

  // Save all posts
  async function savePosts(data, commitMsg) {
    const pass = ADMIN_CONFIG.ADMIN_PASSWORD || sessionStorage.getItem('admin_pass') || 'davidstokes';

    // Try PHP server API first
    try {
      const res = await fetch('/api/posts.php?action=posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': pass
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const out = await res.json();
        if (out && out.ok) return;
      }
    } catch (_) {}

    // Fall back to GitHub API
    let sha = GitHubAPI._postsSha;
    if (!sha) {
      const current = await getFile(ADMIN_CONFIG.POSTS_PATH);
      sha = current.sha;
    }
    await putFile(ADMIN_CONFIG.POSTS_PATH, data, sha, commitMsg || 'Admin: update journal posts');
    GitHubAPI._postsSha = null;
  }

  // Delete a single post by slug
  async function deletePost(slug) {
    const pass = ADMIN_CONFIG.ADMIN_PASSWORD || sessionStorage.getItem('admin_pass') || 'davidstokes';
    try {
      const res = await fetch('/api/posts.php?action=delete&slug=' + encodeURIComponent(slug), {
        method: 'POST',
        headers: { 'X-Admin-Password': pass }
      });
      if (res.ok) {
        const out = await res.json();
        if (out && out.ok) return;
      }
    } catch (_) {}

    const data = await loadPosts();
    data.posts = data.posts.filter(p => p.slug !== slug);
    await savePosts(data, 'Admin: delete post "' + slug + '"');
  }

  // Upload hero / body image — returns public URL
  async function uploadHeroImage(file) {
    const pass = ADMIN_CONFIG.ADMIN_PASSWORD || sessionStorage.getItem('admin_pass') || 'davidstokes';
    try {
      const fd = new FormData();
      fd.append('file', file, file.name);
      const res = await fetch('/api/upload.php?action=upload', {
        method: 'POST',
        headers: { 'X-Admin-Password': pass },
        body: fd
      });
      if (res.ok) {
        const out = await res.json();
        if (out && out.url) return out.url;
      }
    } catch (_) {}

    return uploadImage(file);
  }

  return { loadPosts, savePosts, deletePost, uploadHeroImage, _postsSha: null };
})();
