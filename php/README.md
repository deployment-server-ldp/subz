# SUBZWARI GLOBAL NETWORK — Plain PHP / MySQL Edition

**SUBZWARI's ARE ONE**

This is a from-scratch rebuild of the platform using plain PHP + HTML/CSS/JavaScript
+ MySQL — no Node.js, no build step, no framework. It targets ordinary shared hosting
(cPanel, Hostinger, GoDaddy, etc.) where you upload files over FTP and manage the
database through phpMyAdmin. The original Next.js/Prisma/PostgreSQL version lives in
the repository root and is untouched; this is a parallel implementation.

## What you get

- Full public site: homepage (data-driven stats), member/professional directories,
  countries/cities, businesses, family branches, events, stories, moments, community
  support, and legal/content pages.
- Member dashboard: profile (personal/professional/family/privacy tabs), photo
  upload, verification submission, business/event/story/moment submission, support
  requests, connections/network, notifications, account settings.
- Admin panel: dashboard with live stats, member management, verification review
  queue, countries/cities/category management, business/event/story/moment
  moderation, support request approval, reports triage, staff role management,
  site settings (including homepage hero text), a small CMS for legal/about pages,
  and an audit log viewer.
- `database/schema.sql` — the complete MySQL schema.
- `database/seed.sql` — demo reference data (countries, cities, categories, sample
  CMS pages) — no accounts, since passwords must be hashed by PHP, not raw SQL.
- `create-admin.php` — a one-time setup page that creates your first Super Admin
  account (delete it immediately after use).

## Deployment (shared hosting / cPanel)

### 1. Create the database

1. In cPanel, open **MySQL Databases** and create a new database (e.g.
   `yourcpanelusername_subzwari`).
2. Create a MySQL user and a strong password, and add that user to the database
   with **All Privileges**.
3. Open **phpMyAdmin**, select your new database, go to the **Import** tab, and
   upload `database/schema.sql`. Then import `database/seed.sql` the same way
   (optional, but recommended — it gives you countries/cities/categories to work
   with immediately).

### 2. Configure the app

1. Open `config/config.php` in a text editor and fill in:
   - `DB_HOST` (almost always `localhost` on shared hosting)
   - `DB_NAME`, `DB_USER`, `DB_PASS` (from step 1)
   - `BASE_URL` — the full URL where you're uploading this, e.g.
     `https://www.yourdomain.com` or `https://www.yourdomain.com/subzwari` if it's
     in a subfolder. **No trailing slash.**
2. Once everything works, set `display_errors` to `'0'` in `config/config.php` (near
   the top) so PHP errors never leak to visitors.

### 3. Upload the files

1. Using FTP (FileZilla, or cPanel's **File Manager**), upload the **entire contents
   of the `php/` folder** (not the folder itself) into your hosting account's web
   root — usually `public_html/` (or `public_html/subzwari/` for a subfolder site).
2. Make sure the `uploads/` folder (and its `profiles/`, `moments/`, `businesses/`
   subfolders) are writable by the web server: in cPanel File Manager, right-click
   each → **Change Permissions** → set to `755` (try `775` if uploads fail with a
   permissions error — never `777`).
3. Confirm `.htaccess` files uploaded correctly (some FTP clients hide dotfiles by
   default — enable "show hidden files").

### 4. Create your Super Admin account

1. Visit `https://yourdomain.com/create-admin.php` in your browser.
2. Fill in your email and a strong password (10+ characters, a letter and a number).
3. **Immediately delete `create-admin.php` from the server** (via File Manager or
   FTP) — it refuses to run a second time once a Super Admin exists, but there's no
   reason to leave it reachable.
4. Sign in at `/login.php` and you'll land in `/admin/index.php`.

### 5. Point your domain and go live

If you uploaded to `public_html/` directly, your domain already points at the site.
If you used a subfolder, either move the files to `public_html/` or set up the
subfolder as an addon domain in cPanel. Update `BASE_URL` in `config/config.php` to
match exactly.

## Local development (optional)

If you want to test on your own computer first:

1. Install [XAMPP](https://www.apachefriends.org/) (or MAMP/WAMP) — it bundles
   Apache, PHP, and MySQL.
2. Copy the `php/` folder into `htdocs/subzwari`.
3. Start Apache and MySQL from the XAMPP control panel.
4. Open `http://localhost/phpmyadmin`, create a database, and import
   `database/schema.sql` (and `seed.sql`).
5. Edit `config/config.php`: `DB_HOST=localhost`, your DB name/user/pass, and
   `BASE_URL=http://localhost/subzwari`.
6. Visit `http://localhost/subzwari/create-admin.php`.

## Architecture notes (what's simplified vs. the Next.js version, and why)

This is a deliberate simplification for a plain-PHP, no-build stack — not an
oversight:

- **RBAC**: a single `users.role` enum column instead of dynamic Role/Permission
  tables. Roles are hardcoded (`super_admin`, `admin`, `verification_manager`,
  `content_manager`, `regional_coordinator`, `moderator`, `member`); Super Admin
  always bypasses role checks. This covers the same permission matrix from
  `ARCHITECTURE.md` §G with far less code — editing a member's role in
  `/admin/admins.php` is the equivalent of managing custom roles in the Next.js
  version.
- **Profile tabs**: `/dashboard/profile.php?tab=personal|professional|family|privacy`
  is one file instead of four routes — same functionality, fewer files.
- **File uploads**: profile photos and moment photos save directly to
  `uploads/<subfolder>/` on the server's local disk (validated by real MIME-type
  sniffing, random filenames, PHP execution disabled in that folder via
  `.htaccess`) instead of S3/R2 — the right call for shared hosting, which has no
  object storage.
- **Auth**: email + password only (PHP `password_hash`/`password_verify`, bcrypt).
  No email OTP, no Google OAuth — both require either a working SMTP setup or OAuth
  app registration, neither of which is a safe default to assume for a fresh shared
  host. Add them later once you have an SMTP provider (PHPMailer + your host's SMTP,
  or a transactional email API).
- **No background jobs / cron**: scheduled story publishing works by checking
  `scheduled_at <= NOW()` at read time (same trick the Next.js version uses) rather
  than a cron-driven publish step.
- **City slugs** are unique per-country, not globally; `city.php?slug=` takes the
  first match. Avoid giving two cities in different countries the same name+slug,
  or disambiguate the query if you need to.

## Security notes

- All queries use PDO prepared statements — never concatenate user input into SQL.
- Every state-changing form includes a CSRF token (`csrf_field()` / `require_csrf()`
  in `includes/functions.php`).
- Sensitive fields (phone, home address, government ID reference) live in
  `private_contact_info`, a separate table from `profiles`, so a page that does
  `SELECT * FROM profiles` structurally cannot leak them.
- Uploaded files are validated by real content sniffing (`mime_content_type`), saved
  under randomized names, and PHP execution is disabled in `uploads/` via
  `.htaccess`.
- `config/`, `includes/`, and `database/` are blocked from direct web access via
  `.htaccess` (`Require all denied`).
- Passwords are hashed with PHP's `PASSWORD_DEFAULT` (bcrypt) — never stored or
  logged in plaintext.
- There is no rate limiting on login/register in this simplified edition (unlike the
  Next.js version). If this matters for your deployment, add a `failed_attempts` +
  `locked_until` pair of columns on `users` and check them in `login.php`.

## What's NOT built (same as the Next.js version, by design)

No payments, donations, fundraising, real-time chat, video calling, or a mobile app.
This is a community network, not a marketplace or NGO platform.
