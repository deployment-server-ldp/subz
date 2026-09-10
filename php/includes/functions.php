<?php
require_once __DIR__ . '/../config/db.php';

/** Escape for safe HTML output — call this around every piece of user data you print. */
function e(?string $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

function redirect(string $path): void
{
    header('Location: ' . BASE_URL . $path);
    exit;
}

function slugify(string $text): string
{
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    return trim($text, '-') ?: 'item';
}

function unique_slug(string $text): string
{
    return slugify($text) . '-' . substr(bin2hex(random_bytes(3)), 0, 6);
}

// --- Flash messages (one-time notices shown after a redirect) ---
function flash(string $key, ?string $message = null)
{
    if ($message !== null) {
        $_SESSION['flash'][$key] = $message;
        return;
    }
    if (!empty($_SESSION['flash'][$key])) {
        $msg = $_SESSION['flash'][$key];
        unset($_SESSION['flash'][$key]);
        return $msg;
    }
    return null;
}

// --- CSRF protection ---
function csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf_token" value="' . e(csrf_token()) . '">';
}

function require_csrf(): void
{
    $token = $_POST['csrf_token'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
        http_response_code(403);
        die('Invalid or expired form submission. Please go back and try again.');
    }
}

// --- Auth ---
function current_user(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    static $user = null;
    if ($user === null) {
        $stmt = db()->prepare('SELECT * FROM users WHERE id = ? AND account_status = "active" LIMIT 1');
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch() ?: false;
    }
    return $user ?: null;
}

function current_profile(): ?array
{
    $user = current_user();
    if (!$user) {
        return null;
    }
    static $profile = null;
    if ($profile === null) {
        $stmt = db()->prepare('SELECT * FROM profiles WHERE user_id = ? LIMIT 1');
        $stmt->execute([$user['id']]);
        $profile = $stmt->fetch() ?: false;
    }
    return $profile ?: null;
}

function require_login(): array
{
    $user = current_user();
    if (!$user) {
        flash('error', 'Please sign in to continue.');
        redirect('/login.php');
    }
    return $user;
}

// Staff roles, ordered loosely by scope. Kept as a single `role` column on
// users for simplicity (see php/README.md for why this is simpler than the
// Next.js version's dynamic RBAC tables).
const STAFF_ROLES = ['super_admin', 'admin', 'verification_manager', 'content_manager', 'regional_coordinator', 'moderator'];

function is_staff(array $user): bool
{
    return in_array($user['role'], STAFF_ROLES, true);
}

/** Coarse role gate for whole admin pages. Pass one or more allowed roles, or none to allow any staff role. */
function require_role(array $allowed = []): array
{
    $user = require_login();
    if ($user['role'] === 'super_admin') {
        return $user; // Super Admin bypasses all role checks.
    }
    if (!empty($allowed) && !in_array($user['role'], $allowed, true)) {
        http_response_code(403);
        die('You do not have permission to view this page.');
    }
    if (empty($allowed) && !is_staff($user)) {
        http_response_code(403);
        die('Staff access required.');
    }
    return $user;
}

// --- Audit log ---
function write_audit_log(int $actorId, string $action, string $targetType, ?string $targetId = null, ?array $metadata = null): void
{
    $stmt = db()->prepare('INSERT INTO audit_logs (actor_id, action, target_type, target_id, metadata, created_at) VALUES (?, ?, ?, ?, ?, NOW())');
    $stmt->execute([$actorId, $action, $targetType, $targetId, $metadata ? json_encode($metadata) : null]);
}

// --- Notifications ---
function notify(int $recipientUserId, string $type, ?string $link = null): void
{
    $stmt = db()->prepare('INSERT INTO notifications (recipient_id, type, link, is_read, created_at) VALUES (?, ?, ?, 0, NOW())');
    $stmt->execute([$recipientUserId, $type, $link]);
}

// --- File uploads ---
function upload_image(string $fieldName, string $subfolder): ?string
{
    if (empty($_FILES[$fieldName]) || $_FILES[$fieldName]['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    $file = $_FILES[$fieldName];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Upload failed. Please try a smaller image.');
    }
    if ($file['size'] > MAX_UPLOAD_BYTES) {
        throw new RuntimeException('Image must be 5MB or smaller.');
    }

    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
    $mime = mime_content_type($file['tmp_name']);
    if (!isset($allowed[$mime])) {
        throw new RuntimeException('Only JPEG, PNG, WebP, and GIF images are allowed.');
    }

    $dir = UPLOAD_DIR . '/' . $subfolder;
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }

    $filename = bin2hex(random_bytes(16)) . '.' . $allowed[$mime];
    $destination = $dir . '/' . $filename;
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        throw new RuntimeException('Could not save the uploaded file.');
    }

    return $subfolder . '/' . $filename;
}

function upload_url(?string $path): ?string
{
    return $path ? UPLOAD_URL . '/' . ltrim($path, '/') : null;
}

// --- Pagination ---
function paginate(int $page, int $totalRows, int $perPage = 12): array
{
    $totalPages = max(1, (int) ceil($totalRows / $perPage));
    $page = max(1, min($page, $totalPages));
    return ['page' => $page, 'totalPages' => $totalPages, 'offset' => ($page - 1) * $perPage, 'perPage' => $perPage];
}

function query_string_with(array $overrides): string
{
    $params = array_merge($_GET, $overrides);
    return http_build_query($params);
}

/** Reads a published CMS page by slug, or null if not created yet (caller supplies a fallback). */
function get_cms_page(string $slug): ?array
{
    $stmt = db()->prepare("SELECT * FROM pages WHERE slug = ? AND status = 'published' LIMIT 1");
    $stmt->execute([$slug]);
    return $stmt->fetch() ?: null;
}

function get_setting(string $category, string $key, string $default = ''): string
{
    $stmt = db()->prepare('SELECT setting_value FROM site_settings WHERE category = ? AND setting_key = ? LIMIT 1');
    $stmt->execute([$category, $key]);
    $value = $stmt->fetchColumn();
    return $value !== false ? $value : $default;
}

/** Renders a full public page (header/body/footer) for a simple CMS-backed content page, with a fallback if the admin hasn't created it yet. */
function render_simple_page(string $slug, string $defaultTitle, string $defaultBody): void
{
    $page = get_cms_page($slug);
    $pageTitle = $page['title'] ?? $defaultTitle;
    require __DIR__ . '/header.php';
    ?>
    <div class="container-narrow" style="padding:64px 24px;">
      <h1 class="display"><?= e($page['title'] ?? $defaultTitle) ?></h1>
      <div style="white-space:pre-wrap; margin-top:16px; color:var(--muted-foreground);"><?= e($page['body'] ?? $defaultBody) ?></div>
    </div>
    <?php
    require __DIR__ . '/footer.php';
}
