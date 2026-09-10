<?php
/**
 * One-time setup script: creates the first Super Admin account.
 * Delete this file after use — it stays reachable otherwise, and while it
 * refuses to run once a Super Admin exists, there's no reason to leave it
 * on a live server.
 */
require_once __DIR__ . '/includes/functions.php';

$existingAdminCount = (int) db()->query("SELECT COUNT(*) FROM users WHERE role = 'super_admin'")->fetchColumn();
$errors = [];
$done = false;

if ($existingAdminCount > 0) {
    http_response_code(403);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $email = strtolower(trim($_POST['email'] ?? ''));
    $password = $_POST['password'] ?? '';

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Enter a valid email address.';
    }
    if (strlen($password) < 10 || !preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
        $errors[] = 'Password must be at least 10 characters and include a letter and a number.';
    }

    if (empty($errors)) {
        $stmt = db()->prepare('SELECT id FROM users WHERE email=?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $errors[] = 'An account with that email already exists — promote it to Super Admin from phpMyAdmin instead (UPDATE users SET role="super_admin" WHERE email=...).';
        }
    }

    if (empty($errors)) {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        db()->beginTransaction();
        $stmt = db()->prepare('INSERT INTO users (email, password_hash, role, email_verified_at, created_at, updated_at) VALUES (?, ?, "super_admin", NOW(), NOW(), NOW())');
        $stmt->execute([$email, $hash]);
        $userId = (int) db()->lastInsertId();
        $stmt = db()->prepare('INSERT INTO profiles (user_id, first_name, last_name, slug, visibility, verification_status, created_at, updated_at) VALUES (?, "Super", "Admin", ?, "private", "verified", NOW(), NOW())');
        $stmt->execute([$userId, unique_slug('super-admin')]);
        db()->commit();
        $done = true;
    }
}
?>
<!doctype html>
<html><head><meta charset="utf-8"><title>Create Super Admin</title><link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css"></head>
<body>
<div class="container-narrow" style="padding:64px 24px;">
  <?php if ($existingAdminCount > 0): ?>
    <div class="alert alert-error">A Super Admin already exists. This script has been disabled. Delete create-admin.php from your server.</div>
  <?php elseif ($done): ?>
    <div class="alert alert-success">Super Admin created. <strong>Delete create-admin.php now</strong>, then <a href="<?= BASE_URL ?>/login.php">sign in</a>.</div>
  <?php else: ?>
    <h1 class="display">Create Super Admin</h1>
    <p class="text-muted">This form only works once, before any Super Admin exists. Delete this file immediately after use.</p>
    <?php foreach ($errors as $err): ?><div class="alert alert-error"><?= e($err) ?></div><?php endforeach; ?>
    <form method="post" class="card" style="max-width:420px;">
      <?= csrf_field() ?>
      <div class="field"><label>Email</label><input type="email" name="email" required></div>
      <div class="field"><label>Password</label><input type="password" name="password" minlength="10" required></div>
      <button type="submit" class="btn btn-primary" style="width:100%;">Create Super Admin</button>
    </form>
  <?php endif; ?>
</div>
</body></html>
