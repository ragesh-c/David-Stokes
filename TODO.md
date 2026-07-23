# David Stokes Website — To-Do List

## Pending Action Items

### 🐵 Mailchimp Newsletter & Waitlist Integration
David has a Mailchimp account! To hook up the waitlist & newsletter signup forms:
- [ ] **Log into Mailchimp**: Log into David's Mailchimp account at [mailchimp.com](https://mailchimp.com).
- [ ] **Find Embedded Form Action URL**:
  1. Go to **Audience** → **Signup forms** → **Embedded forms**.
  2. Customize or view the form HTML snippet.
  3. Copy the `action="..."` URL from the Mailchimp code snippet.
     (It looks like: `https://davidstokes.us1.list-manage.com/subscribe/post?u=abc123xyz...&id=789xyz...`)
  4. Note the hidden spam honeypot input field name (e.g. `b_abc123xyz..._789xyz...`).
- [ ] **Paste Action URL in Website Code**:
  - Replace `https://YOURACCOUNT.us1.list-manage.com/subscribe/post?u=XXXXXXXXXXXXXXXXXXXXXXXX&amp;id=XXXXXXXXXX` with David's actual Mailchimp URL in:
    - [`index.html`](file:///Users/bindurajesh/David-Stokes-master/index.html#L453) (Homepage Waitlist Section)
    - [`waitlist.html`](file:///Users/bindurajesh/David-Stokes-master/waitlist.html#L415) (Standalone Waitlist Page)
    - [`books/sermon-of-the-wolf.html`](file:///Users/bindurajesh/David-Stokes-master/books/sermon-of-the-wolf.html#L258) (Book Detail Page)
- [ ] **Test Mailchimp Signup**: Submit a test email on `http://localhost:8080/waitlist.html` and verify the contact appears in David's Mailchimp Audience dashboard.

### ✉️ Web3Forms Contact Form Integration
- [ ] **Create Web3Forms Key**: Go to [web3forms.com](https://web3forms.com), enter David's email, and copy the Access Key.
- [ ] **Paste Access Key in Code**: In [`contact.html`](file:///Users/bindurajesh/David-Stokes-master/contact.html#L100), replace `YOUR_WEB3FORMS_ACCESS_KEY_HERE` with the key.
- [ ] **Test Contact Message**: Send a test message on `http://localhost:8080/contact.html` to confirm it delivers directly to David's inbox.
