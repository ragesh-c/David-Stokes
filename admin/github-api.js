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

  // ── Read a file (returns { content (decoded), sha }) ────────────────────────
  async function getFile(repoPath) {
    const res  = await fetch(apiUrl(repoPath) + '?ref=' + ADMIN_CONFIG.GITHUB_BRANCH, { headers: headers() });
    if (!res.ok) throw new Error('Could not read ' + repoPath + ' (' + res.status + ')');
    const data = await res.json();
    return {
      content: JSON.parse(atob(data.content.replace(/\n/g, ''))),
      sha:     data.sha,
    };
  }

  // ── Write a file (creates or updates) ──────────────────────────────────────
  async function putFile(repoPath, jsonContent, sha, commitMessage) {
    const body = {
      message: commitMessage || 'Admin: update ' + repoPath,
      branch:  ADMIN_CONFIG.GITHUB_BRANCH,
      content: btoa(unescape(encodeURIComponent(JSON.stringify(jsonContent, null, 2)))),
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
      const res = await fetch('/api/posts');
      return res.json();
    }
    const { content, sha } = await getFile(ADMIN_CONFIG.POSTS_PATH);
    // stash sha for subsequent saves
    GitHubAPI._postsSha = sha;
    return content;
  }

  // Save all posts (pass full { posts:[...] } object)
  async function savePosts(data, commitMsg) {
    if (ADMIN_CONFIG.isLocal) {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Local server write failed');
      return;
    }
    // Re-fetch sha in case it changed since last load
    let sha = GitHubAPI._postsSha;
    if (!sha) {
      const current = await getFile(ADMIN_CONFIG.POSTS_PATH);
      sha = current.sha;
    }
    await putFile(ADMIN_CONFIG.POSTS_PATH, data, sha, commitMsg || 'Admin: update journal posts');
    // invalidate cached sha
    GitHubAPI._postsSha = null;
  }

  // Delete a single post by slug
  async function deletePost(slug) {
    const data = await loadPosts();
    data.posts = data.posts.filter(p => p.slug !== slug);
    await savePosts(data, 'Admin: delete post "' + slug + '"');
  }

  // Upload hero image — returns public URL
  async function uploadHeroImage(file) {
    if (ADMIN_CONFIG.isLocal) {
      const fd  = new FormData();
      fd.append('file', file, file.name);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const out = await res.json();
      if (!res.ok || !out.url) throw new Error(out.error || 'Upload failed');
      return out.url;
    }
    return uploadImage(file);
  }

  return { loadPosts, savePosts, deletePost, uploadHeroImage, _postsSha: null };
})();
