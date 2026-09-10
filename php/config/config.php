<?php
/**
 * SUBZWARI GLOBAL NETWORK — main configuration.
 *
 * Fill in your real database credentials and site URL before uploading to
 * your hosting account. Never commit real production credentials to git.
 */

// --- Database ---
define('DB_HOST', 'localhost');       // usually 'localhost' on shared hosting
define('DB_NAME', 'subzwari_db');     // the database you create in cPanel
define('DB_USER', 'subzwari_user');   // the DB user you create in cPanel
define('DB_PASS', 'CHANGE_ME');       // that user's password

// --- Site ---
define('SITE_NAME', 'SUBZWARI GLOBAL NETWORK');
define('SITE_TAGLINE', "SUBZWARI's ARE ONE");
// No trailing slash, e.g. https://www.subzwari.com
define('BASE_URL', 'http://localhost/subzwari');

// --- Uploads ---
define('UPLOAD_DIR', __DIR__ . '/../uploads');
define('UPLOAD_URL', BASE_URL . '/uploads');
define('MAX_UPLOAD_BYTES', 5 * 1024 * 1024); // 5MB

// --- Error reporting (turn display_errors OFF in production) ---
error_reporting(E_ALL);
ini_set('display_errors', '1');

// --- Sessions ---
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

date_default_timezone_set('UTC');
