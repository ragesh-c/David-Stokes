# Links Guide — David Stokes Website

All placeholder strings that need replacing before launch. Search the codebase for each string and replace with the real value.

## Placeholder Reference

| Placeholder | What it is | Where to find / notes |
|---|---|---|
| `9781915603197` | Amazon ASIN — King Alfred's Daughter | Already live: https://www.amazon.co.uk/King-Alfreds-Daughter-remarkable-Ã†thelflÃ¦d-ebook/dp/B0BZDP8Y81 |
| `1789018404` | Amazon ASIN — Angles or Angels? | Check Amazon seller account |
| `PLACEHOLDER-SOTW` | Amazon ASIN — Sermon of the Wolf | Available when Foreshore Books sets up pre-order |
| `B075CR5S4B` | Amazon ASIN — The Happy Ending | Check Amazon seller account |
| `B09L4YF633` | Amazon ASIN — The Singing Bowl | Check Amazon seller account |
| `B09L4YF633-KOBO` | Kobo link — The Singing Bowl | Log in to Kobo account |
| `B09L4YF633-BN` | Barnes & Noble link — The Singing Bowl | Check B&N account |
| `B09L4YF633-APPLE` | Apple Books link — The Singing Bowl | Check Apple Books account |
| `ACTION_URL_HERE` | Mailchimp newsletter form endpoint | From Mailchimp → Audience → Signup forms → Embedded form → copy the action URL |
| `FORMSPREE_URL_HERE` | Formspree contact/speaking form endpoint | Sign up at formspree.io → create form → copy endpoint URL |
| `EMAIL_PLACEHOLDER` | David's public contact email | e.g. david@davidstokesauthor.com |
| `FACEBOOK_URL` | Facebook profile URL | e.g. https://www.facebook.com/davidstokesauthor |
| `TWITTER_URL` | Twitter/X profile URL | e.g. https://twitter.com/davidstokes |
| `INSTAGRAM_URL` | Instagram profile URL | e.g. https://www.instagram.com/davidstokesauthor |
| `GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID | From Google Analytics account → Admin → Data Streams → Web → Measurement ID |

## How to replace

Use a code editor's Find & Replace (Ctrl+H in VS Code). Make sure "Search in all files" is enabled.

Replace one placeholder at a time and check each page after replacing.

## Before launch checklist

- [ ] All PLACEHOLDER-* strings replaced with real Amazon links
- [ ] ACTION_URL_HERE replaced with Mailchimp endpoint
- [ ] FORMSPREE_URL_HERE replaced with Formspree endpoint (test form submission)
- [ ] EMAIL_PLACEHOLDER replaced with real email
- [ ] Social URLs replaced (or links removed if accounts are inactive)
- [ ] GA_MEASUREMENT_ID uncommented and replaced (if using analytics)
- [ ] All placeholder images replaced with real images
- [ ] DEPLOY-GUIDE.md followed to completion


