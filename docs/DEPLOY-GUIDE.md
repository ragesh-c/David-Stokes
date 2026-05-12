# Deploy Guide — David Stokes Website

Step-by-step instructions for deploying this website to Netlify with the domain davidstokesauthor.com.

Written for someone who has never deployed a website before. Take it one step at a time.

---

## Step 1: Create a GitHub account

1. Go to https://github.com
2. Click **Sign up**
3. Choose a username (something professional, e.g. `davidstokesauthor`)
4. Enter your email and create a password
5. Verify your email address

---

## Step 2: Create a new GitHub repository

1. Once logged in, click the **+** icon in the top right → **New repository**
2. Repository name: `david-stokes-website`
3. Set visibility to **Public** (required for free Netlify deployment)
4. Click **Create repository**

---

## Step 3: Upload the website files

**Option A — Using GitHub's web interface (easiest):**
1. On your new repository page, click **uploading an existing file**
2. Drag and drop all the website files and folders into the upload area
3. Important: upload the *contents* of the `david-stokes-website` folder (not the folder itself)
4. The root of your repository should contain `index.html`, `css/`, `js/`, `books/`, `journal/`, etc.
5. Click **Commit changes**

**Option B — Using GitHub Desktop (recommended for future updates):**
1. Download GitHub Desktop from https://desktop.github.com
2. Sign in with your GitHub account
3. Clone your repository to your computer
4. Copy website files into the cloned folder
5. In GitHub Desktop, click **Commit to main** → **Push origin**

---

## Step 4: Create a Netlify account

1. Go to https://www.netlify.com
2. Click **Sign up** → choose **Sign up with GitHub** (this links your accounts)
3. Authorise Netlify to access your GitHub

---

## Step 5: Deploy from GitHub

1. In Netlify, click **Add new site** → **Import an existing project**
2. Click **GitHub**
3. Select your `david-stokes-website` repository
4. Build settings: leave everything **blank** (this is a static site, no build step needed)
5. Click **Deploy site**
6. Netlify will give you a temporary URL like `random-name.netlify.app` — this is your live site!
7. Open the URL to verify the site looks correct

---

## Step 6: Set your custom domain

1. In Netlify, go to your site → **Domain management** → **Add a domain**
2. Enter `davidstokesauthor.com` and click **Verify**
3. Netlify will show you the DNS records you need to add

---

## Step 7: Update DNS at your current registrar

Your domain is currently registered somewhere (GoDaddy, Namecheap, or similar).

1. Log in to your domain registrar
2. Find **DNS settings** or **Nameservers** for `davidstokesauthor.com`
3. Add the DNS records Netlify gave you in Step 6

**For most setups, you'll add:**
- An **A record** pointing to Netlify's IP: `75.2.60.5`
- A **CNAME record** for `www` pointing to your Netlify subdomain (e.g. `random-name.netlify.app`)

Alternatively, you can point your nameservers to Netlify's nameservers (Netlify will tell you which ones).

DNS changes take 24–48 hours to fully propagate.

---

## Step 8: Verify HTTPS is active

Once DNS has propagated:
1. Visit `https://davidstokesauthor.com` in your browser
2. You should see a padlock icon in the address bar
3. Netlify automatically provisions an SSL certificate via Let's Encrypt — no action needed

If HTTPS isn't active after 48 hours, go to Netlify → **Domain management** → **HTTPS** and click **Verify DNS configuration**.

---

## Step 9: Complete the pre-launch checklist

Before announcing the site, go through `docs/LINKS-GUIDE.md` and replace all placeholder content.

---

## Step 10: How to update the site after launch

**Using GitHub's web interface:**
1. Go to your repository on github.com
2. Navigate to the file you want to edit
3. Click the pencil (edit) icon
4. Make your changes
5. Click **Commit changes**
6. Netlify will automatically detect the change and redeploy (usually takes 1–2 minutes)

**Using GitHub Desktop:**
1. Make changes to files on your computer
2. Open GitHub Desktop
3. Review the changes
4. Write a commit message (e.g. "Update contact email")
5. Click **Commit to main** → **Push origin**
6. Netlify redeploys automatically

---

## Troubleshooting

**Site shows "Page not found":** Make sure `index.html` is in the root of the repository, not inside a subfolder.

**Images not showing:** File names are case-sensitive on Netlify. Make sure image filenames in your HTML match exactly (e.g. `about-portrait.jpg` not `About-Portrait.jpg`).

**Forms not working:** Replace `FORMSPREE_URL_HERE` with your Formspree endpoint, and `ACTION_URL_HERE` with your Mailchimp endpoint (see `LINKS-GUIDE.md`).

**Newsletter sign-ups not arriving:** Check your Mailchimp audience dashboard. Make sure the form action URL is correct.

**Custom domain not loading:** DNS propagation can take up to 48 hours. Check status at https://dnschecker.org.

---

*Guide prepared March 2026.*
