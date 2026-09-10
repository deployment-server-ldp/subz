<?php
$activeNav = 'members';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

$id = (int) ($_GET['id'] ?? 0);

$stmt = db()->prepare('SELECT p.*, u.email, u.account_status, c.name AS country_name, ci.name AS city_name FROM profiles p
    INNER JOIN users u ON u.id = p.user_id LEFT JOIN countries c ON c.id = p.country_id LEFT JOIN cities ci ON ci.id = p.city_id
    WHERE p.id = ? LIMIT 1');
$stmt->execute([$id]);
$member = $stmt->fetch();
if (!$member) {
    http_response_code(404);
    die('Member not found.');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $decision = $_POST['decision'] === 'suspend' ? 'suspended' : 'verified';
    db()->prepare('UPDATE profiles SET verification_status=?, updated_at=NOW() WHERE id=?')->execute([$decision, $member['id']]);
    write_audit_log($__user['id'], $decision === 'suspended' ? 'member.suspend' : 'member.restore', 'Profile', (string) $member['id']);
    flash('success', 'Member updated.');
    redirect('/admin/member.php?id=' . $member['id']);
}

$stmt = db()->prepare('SELECT * FROM verification_requests WHERE profile_id=? ORDER BY created_at DESC');
$stmt->execute([$member['id']]);
$requests = $stmt->fetchAll();
?>
<h1 class="display"><?= e($member['first_name'] . ' ' . $member['last_name']) ?></h1>
<p class="text-muted"><?= e($member['email']) ?></p>
<p><span class="badge badge-warning"><?= e(str_replace('_', ' ', $member['verification_status'])) ?></span></p>

<div class="card" style="max-width:600px;">
  <h3>Profile</h3>
  <table>
    <tr><td>Country</td><td><?= e($member['country_name'] ?? '—') ?></td></tr>
    <tr><td>City</td><td><?= e($member['city_name'] ?? '—') ?></td></tr>
    <tr><td>Profession</td><td><?= e($member['profession'] ?? '—') ?></td></tr>
    <tr><td>Visibility</td><td><?= e($member['visibility']) ?></td></tr>
    <tr><td>Joined</td><td><?= e(date('M j, Y', strtotime($member['created_at']))) ?></td></tr>
    <tr><td>Account status</td><td><?= e($member['account_status']) ?></td></tr>
  </table>
</div>

<?php if (!empty($requests)): ?>
<div class="card" style="max-width:600px;">
  <h3>Verification History</h3>
  <?php foreach ($requests as $r): ?>
    <p><?= e(date('M j, Y', strtotime($r['created_at']))) ?> — <?= e(str_replace('_', ' ', $r['status'])) ?></p>
  <?php endforeach; ?>
</div>
<?php endif; ?>

<div class="card" style="max-width:600px;">
  <h3>Actions</h3>
  <form method="post" data-confirm="Are you sure?">
    <?= csrf_field() ?>
    <?php if ($member['verification_status'] === 'suspended'): ?>
      <input type="hidden" name="decision" value="restore">
      <button type="submit" class="btn btn-primary btn-sm">Restore Member</button>
    <?php else: ?>
      <input type="hidden" name="decision" value="suspend">
      <button type="submit" class="btn btn-danger btn-sm">Suspend Member</button>
    <?php endif; ?>
  </form>
</div>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
