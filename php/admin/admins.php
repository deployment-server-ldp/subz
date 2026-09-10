<?php
$activeNav = 'admins';
$requiredRoles = ['super_admin'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

$roles = ['super_admin', 'admin', 'verification_manager', 'content_manager', 'regional_coordinator', 'moderator', 'member'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $email = strtolower(trim($_POST['email'] ?? ''));
    $role = in_array($_POST['role'] ?? '', $roles, true) ? $_POST['role'] : 'member';

    $stmt = db()->prepare('SELECT * FROM users WHERE email=?');
    $stmt->execute([$email]);
    $target = $stmt->fetch();

    if (!$target) {
        flash('error', 'No account exists with that email.');
    } elseif ((int) $target['id'] === (int) $__user['id'] && $role !== 'super_admin') {
        flash('error', "You can't remove your own Super Admin access.");
    } else {
        db()->prepare('UPDATE users SET role=?, updated_at=NOW() WHERE id=?')->execute([$role, $target['id']]);
        write_audit_log($__user['id'], 'user.setRole', 'User', (string) $target['id'], ['role' => $role]);
        flash('success', 'Role updated.');
    }
    redirect('/admin/admins.php');
}

$admins = db()->query("SELECT * FROM users WHERE role != 'member' ORDER BY created_at ASC")->fetchAll();
?>
<h1 class="display">Admins</h1>
<p class="text-muted">Grant staff access by email. The member must already have an account.</p>

<form method="post" class="card field-row" style="align-items:flex-end;">
  <?= csrf_field() ?>
  <div class="field"><label>Member email</label><input type="email" name="email" required></div>
  <div class="field">
    <label>Role</label>
    <select name="role">
      <?php foreach ($roles as $r): ?><option value="<?= $r ?>"><?= e(str_replace('_', ' ', ucfirst($r))) ?></option><?php endforeach; ?>
    </select>
  </div>
  <div class="field"><button type="submit" class="btn btn-primary btn-sm">Set role</button></div>
</form>

<table>
  <tr><th>Email</th><th>Role</th><th>Joined</th></tr>
  <?php foreach ($admins as $a): ?>
    <tr>
      <td><?= e($a['email']) ?></td>
      <td><span class="badge badge-accent"><?= e(str_replace('_', ' ', $a['role'])) ?></span></td>
      <td><?= e(date('M j, Y', strtotime($a['created_at']))) ?></td>
    </tr>
  <?php endforeach; ?>
</table>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
