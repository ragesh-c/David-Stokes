#!/usr/bin/env python3
"""
Fast, targeted deployment to /davidstokesauthor.com/public_html via FTP.
"""

import os
import sys
import ftplib
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def log(msg):
    print(msg, flush=True)

def load_env():
    env_file = ROOT / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

load_env()

FTP_HOST = os.environ.get("FTP_HOST", "ftp.davidstokesauthor.com")
FTP_PORT = int(os.environ.get("FTP_PORT", 21))
FTP_USER = os.environ.get("FTP_USER", "spiro@davidstokesauthor.com")
FTP_PASS = os.environ.get("FTP_PASS", "ey471w4121ql")

REMOTE_ROOT = "/davidstokesauthor.com/public_html"

FILES_TO_UPLOAD = [
    ".htaccess",
    "_redirects",
    "purge.php",
    "robots.txt",
    "sitemap.xml",
    "favicon.ico",
    "google99400f98f1b41770.html",
    # Root pages
    "index.page", "index.php",
    "about.page", "about.php",
    "books.page", "books.php",
    "journal.page", "journal.php",
    "contact.page", "contact.php",
    "media.page", "media.php",
    "waitlist.page", "waitlist.php",
    # Data
    "data/journal-posts.json",
    # Admin
    "admin/admin.css",
    "admin/config.js",
    "admin/github-api.js",
    "admin/index.html",
    "admin/login.html",
    "admin/post.html",
    # API
    "api/index.php",
    # CSS & JS
    "css/reset.css",
    "css/styles.css",
    "css/theme.css",
    "js/anime.min.js",
    "js/main.js",
    "js/theme.js",
    # Books
    "books/angles-or-angels.page", "books/angles-or-angels.php",
    "books/king-alfreds-daughter.page", "books/king-alfreds-daughter.php",
    "books/sermon-of-the-wolf.page", "books/sermon-of-the-wolf.php",
    "books/the-happy-ending.page", "books/the-happy-ending.php",
    "books/the-singing-bowl.page", "books/the-singing-bowl.php",
    # Journal
    "journal/post.html",
    "journal/coronation-of-the-king.page", "journal/coronation-of-the-king.php",
    "journal/finding-aethelflad-in-chester.page", "journal/finding-aethelflad-in-chester.php",
    "journal/finding-aethelflad-in-derby.page", "journal/finding-aethelflad-in-derby.php",
    "journal/finding-aethelflad-in-leicester.page", "journal/finding-aethelflad-in-leicester.php",
    "journal/finding-aethelflad-in-shrewsbury.page", "journal/finding-aethelflad-in-shrewsbury.php",
    "journal/finding-aethelflad-in-tamworth.page", "journal/finding-aethelflad-in-tamworth.php",
    "journal/finding-aethelflad-in-warwick.page", "journal/finding-aethelflad-in-warwick.php",
    "journal/finding-aethelflad-in-worcester.page", "journal/finding-aethelflad-in-worcester.php",
    "journal/gloucester-aethelflads-capital.page", "journal/gloucester-aethelflads-capital.php",
    "journal/kingston-the-coronation-stone.page", "journal/kingston-the-coronation-stone.php",
    # Critical Images
    "Img/Sermon-of-the-Wolf.png",
    "Img/Sermon-of-the-Wolf.jpg",
    "Img/Blogs/1788524654-Soc_Media_BT_scene_Aelfrida.jpg",
]

STALE_HTML_TO_REMOVE = [
    "about.html",
    "books.html",
    "contact.html",
    "index.html",
    "journal.html",
    "media.html",
    "waitlist.html",
    "books/angles-or-angels.html",
    "books/king-alfreds-daughter.html",
    "books/sermon-of-the-wolf.html",
    "books/the-happy-ending.html",
    "books/the-singing-bowl.html",
    "journal/coronation-of-the-king.html",
    "journal/finding-aethelflad-in-chester.html",
    "journal/finding-aethelflad-in-derby.html",
    "journal/finding-aethelflad-in-leicester.html",
    "journal/finding-aethelflad-in-shrewsbury.html",
    "journal/finding-aethelflad-in-tamworth.html",
    "journal/finding-aethelflad-in-warwick.html",
    "journal/finding-aethelflad-in-worcester.html",
    "journal/gloucester-aethelflads-capital.html",
    "journal/kingston-the-coronation-stone.html",
]


def ensure_remote_dir(ftp, remote_dir):
    parts = [p for p in remote_dir.split('/') if p]
    current = ""
    for part in parts:
        current += "/" + part
        try:
            ftp.cwd(current)
        except ftplib.error_perm:
            try:
                ftp.mkd(current)
                log(f"Created directory: {current}")
            except Exception:
                pass


def main():
    log(f"Connecting to {FTP_HOST} as {FTP_USER}...")
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, FTP_PORT, timeout=30)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)
    log("Connected successfully!")

    # 1. Remove stale HTML files
    log("\nRemoving any stale .html files from production...")
    for rel_path in STALE_HTML_TO_REMOVE:
        target = f"{REMOTE_ROOT}/{rel_path}"
        try:
            ftp.delete(target)
            log(f"  Removed: {rel_path}")
        except Exception:
            pass

    # 2. Upload files
    log(f"\nUploading {len(FILES_TO_UPLOAD)} files to {REMOTE_ROOT}...")
    uploaded = 0
    for rel_path in FILES_TO_UPLOAD:
        local_file = ROOT / rel_path
        if not local_file.exists():
            log(f"  Skip (local file not found): {rel_path}")
            continue

        remote_path = f"{REMOTE_ROOT}/{rel_path}"
        remote_dir = os.path.dirname(remote_path)
        ensure_remote_dir(ftp, remote_dir)
        ftp.cwd(remote_dir)

        filename = os.path.basename(remote_path)
        with open(local_file, "rb") as f:
            ftp.storbinary(f"STOR {filename}", f)
        uploaded += 1
        log(f"  [{uploaded}/{len(FILES_TO_UPLOAD)}] ✓ {rel_path}")

    ftp.quit()
    log("\nFTP upload finished successfully!")

    # 3. Cache purge
    log("Purging web cache via purge.php...")
    try:
        req = urllib.request.Request(
            "https://www.davidstokesauthor.com/purge.php",
            headers={"User-Agent": "DeployScript/1.0", "Cache-Control": "no-cache"}
        )
        with urllib.request.urlopen(req, timeout=15) as res:
            log(f"Purge response: {res.read().decode('utf-8', errors='replace').strip()}")
    except Exception as e:
        log(f"Purge notice: {e}")

    log("\n✅ Deployment complete!")


if __name__ == "__main__":
    main()
