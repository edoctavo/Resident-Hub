# Resident Hub

A personal hub for an orthopedic resident: patients with daily SOAP notes, labs and imaging, procedures log, to-dos, week/month schedule, notes, events, resources, budget, and a rotation summary.

It is a static website (HTML + JavaScript) with its own accounts and database provided by [Supabase](https://supabase.com). It does not depend on claude.ai.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app |
| `backend.js` | Login, database and photo storage (Supabase) |
| `config.js` | Your Supabase URL and anon key |
| `supabase/schema.sql` | Database tables and security rules |

## Setup

### 1. Create the backend (about 10 minutes)
1. Sign up at supabase.com and create a new project. Save the database password somewhere safe.
2. Open **SQL Editor > New query**, paste the contents of `supabase/schema.sql`, and press **Run**.
3. Open **Authentication > Providers > Email**. For personal use you can turn **Confirm email** off so sign-up works instantly. Leave it on if you prefer email confirmation.
4. Open **Project Settings > API**. Copy the **Project URL** and the **anon public** key into `config.js`. The anon key is meant to be public because the row-level security rules protect your data. Never paste the `service_role` key anywhere.

### 2. Put it on GitHub
```bash
cd resident-hub-github
git init
git add .
git commit -m "Resident Hub"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/resident-hub.git
git push -u origin main
```
No patient data lives in the repository. It is stored only in your Supabase project.

### 3. Publish with GitHub Pages
**Settings > Pages > Build and deployment > Deploy from a branch > `main` / `(root)` > Save.** Your site appears at `https://YOUR-USERNAME.github.io/resident-hub/` after a minute or two.

Then go back to Supabase **Authentication > URL Configuration** and set **Site URL** to that address, so confirmation and password-reset emails link to the right place.

### 4. Use your own domain, such as residenthub.com (optional)
1. Buy the domain from a registrar (check that it is available; it usually costs about $10 to $15 a year).
2. In your registrar's DNS settings add four `A` records for the root domain: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Add a `CNAME` record for `www` pointing to `YOUR-USERNAME.github.io`. (Confirm the current values in GitHub's "Managing a custom domain for GitHub Pages" docs.)
3. In **Settings > Pages > Custom domain**, enter the domain, save, and tick **Enforce HTTPS** once it is available.
4. Update the **Site URL** in Supabase to the new domain.

### 5. Move your old data over
In the claude.ai version, press **Download backup** on the homepage. In this version, log in and press **Restore backup**. Patients, notes and other entries transfer. Photos do not, and rotations and templates are recreated by hand.

## Running locally
Opening `index.html` directly can behave oddly. Instead run `python3 -m http.server 8000` in this folder and visit `http://localhost:8000`.

## Privacy and security
- Each user can only read and write their own rows and photos (row-level security in `schema.sql`). Photos are in a private bucket and are shown through short-lived links.
- Data is stored in plain text in your Supabase project, which is a third-party service. Patient names, chart numbers and imaging are sensitive. Check your hospital policy and the Philippines Data Privacy Act (or your local law) before storing identifiable patient information.
- Use a strong, unique password. Supabase does not offer two-factor login on the email provider by default, so turn on two-factor for your Supabase and GitHub accounts.
- Regularly use **Download backup**.

## Attachments
Notes, procedures, events and each patient day accept photos, PDF, Word, Excel, PowerPoint, text and CSV files (up to 20 MB each). PDF and text files are read in your browser when you upload them, so the words inside become searchable in the normal search boxes and in Ask Claude. Word and Excel files are stored but not searchable. A scanned PDF has no text to read.

## Ask Claude setup (optional)
The **Ask Claude** page answers questions using only your own notes. Your browser never holds the API key: a small server function, `api/ask.js`, does the asking.

1. Create an API key at console.anthropic.com. API usage is billed separately from a claude.ai subscription, so add a little credit and consider setting a monthly spending limit there.
2. In GitHub use **Add file > Create new file**, type `api/ask.js` as the name (typing the slash makes the folder), paste in the contents of `api/ask.js`, and commit.
3. In Vercel open your project, then **Settings > Environment Variables**, and add:
   - `ANTHROPIC_API_KEY`: your key
   - `SUPABASE_URL`: the same URL as in `config.js`
   - `SUPABASE_ANON_KEY`: the same anon key as in `config.js`
   - `ALLOWED_EMAILS`: your login email (separate several with commas). Only these accounts can use Ask Claude.
   - `CLAUDE_MODEL` (optional): the model to use. The default is `claude-sonnet-5-5`; check Anthropic's model list if you want a different one.
4. In Vercel go to **Deployments**, open the latest one, and choose **Redeploy** so the new settings load.
5. In Supabase turn off **Allow new users to sign up** (under Authentication settings) once your own account exists, so nobody else can register on your site.

Privacy: the question and the few most relevant notes are sent through your Vercel function to Anthropic's API. They are not saved by the app. Hiding names and chart numbers only removes those fields, so names you typed inside a note are still sent. Check Anthropic's current data terms and your hospital's rules before including patient charts.
