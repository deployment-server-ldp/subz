<?php
$activeNav = 'settings';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/member_header.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $action = $_POST['action'] ?? '';

    if ($action === 'change_password') {
        $current = $_POST['current_password'] ?? '';
        $new = $_POST['new_password'] ?? '';
        if (!password_verify($current, $__user['password_hash'])) {
            flash('error', 'Current password is incorrect.');
        } elseif (strlen($new) < 10 || !preg_match('/[A-Za-z]/', $new) || !preg_match('/[0-9]/', $new)) {
            flash('error', 'New password must be at least 10 characters and include a letter and a number.');
        } else {
            db()->prepare('UPDATE users SET password_hash=?, updated_at=NOW() WHERE id=?')->execute([password_hash($new, PASSWORD_DEFAULT), $__user['id']]);
            flash('success', 'Password updated.');
        }
    } elseif ($action === 'deactivate') {
        db()->prepare('UPDATE users SET account_status="deactivated", updated_at=NOW() WHERE id=?')->execute([$__user['id']]);
        $_SESSION = [];
        session_destroy();
        redirect('/index.php');
    }

    redirect('/dashboard/settings.php');
}
?>
<h1 class="display">Account Settings</h1>

<div class="card" style="max-width:480px;">
  <h3>Account</h3>
  <p class="text-muted">Email: <?= e($__user['email']) ?></p>
</div>

<div class="card" style="max-width:480px;">
  <h3>Change Password</h3>
  <form method="post">
    <?= csrf_field() ?>
    <input type="hidden" name="action" value="change_password">
    <div class="field"><label>Current password</label><input type="password" name="current_password" required></div>
    <div class="field"><label>New password</label><input type="password" name="new_password" minlength="10" required></div>
    <button type="submit" class="btn btn-primary">Change password</button>
  </form>
</div>

<div class="card" style="max-width:480px;">
  <h3>Deactivate Account</h3>
  <p class="text-muted">Deactivating signs you out and hides your profile from the community.</p>
  <form method="post" data-confirm="Deactivate your account?">
    <?= csrf_field() ?>
    <input type="hidden" name="action" value="deactivate">
    <button type="submit" class="btn btn-danger btn-sm">Deactivate my account</button>
  </form>
</div>

<?php require __DIR__ . '/../includes/member_footer.php'; ?>
