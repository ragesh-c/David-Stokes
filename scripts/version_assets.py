#!/usr/bin/env python3
"""
Content-hash cache-busting for CSS/JS.

Run this after editing any file listed in ASSETS, then redeploy. Every
<link>/<script> reference to that file, in every .html/.page/.php file in
the repo, gets rewritten to "?v=<hash-of-current-content>". The hash only
changes when the file's bytes change, so:
  - an edit forces every browser (including ones that already cached the
    old URL) to fetch the new version — no more "returning visitors stuck
    on stale CSS/JS" bugs from a forgotten manual version bump.
  - an unrelated deploy leaves the hash untouched, so already-cached,
    unchanged assets keep being served from cache instead of re-fetched.

Usage: python3 scripts/version_assets.py
"""

import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

ASSETS = [
    "css/reset.css",
    "css/styles.css",
    "css/theme.css",
    "js/anime.min.js",
    "js/main.js",
    "js/theme.js",
    "admin/admin.css",
    "admin/config.js",
    "admin/github-api.js",
]

SOURCE_GLOBS = ["*.html", "*.page", "*.php"]


def content_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:10]


def main():
    hashes = {}
    for rel in ASSETS:
        path = ROOT / rel
        if not path.exists():
            print(f"  skip (missing): {rel}")
            continue
        hashes[Path(rel).name] = content_hash(path)

    source_files = []
    for pattern in SOURCE_GLOBS:
        source_files.extend(ROOT.rglob(pattern))
    source_files = [f for f in source_files if ".git" not in f.parts]

    changed_files = 0
    changed_refs = 0
    for src in source_files:
        text = src.read_text(encoding="utf-8")
        original = text
        for basename, digest in hashes.items():
            escaped = re.escape(basename)
            pattern = re.compile(r'(' + escaped + r')(\?[^"\']*)?(?=["\'])')
            text, n = pattern.subn(r'\1?v=' + digest, text)
            changed_refs += n
        if text != original:
            src.write_text(text, encoding="utf-8")
            changed_files += 1

    print("Asset hashes:")
    for basename, digest in hashes.items():
        print(f"  {basename}: {digest}")
    print(f"\nUpdated {changed_refs} references across {changed_files} files.")


if __name__ == "__main__":
    main()
