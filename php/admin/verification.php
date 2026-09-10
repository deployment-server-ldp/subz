<?php
$activeNav = 'verification';
$requiredRoles = ['admin', 'verification_manager', 'regional_coordinator'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

$requests = db()->query("SELECT vr.*, p.first_name, p.last_name, c.name AS country_name FROM verification_requests vr
    INNER JOIN profiles p ON p.id = vr.profile_id LEFT JOIN countries c ON c.id = p.country_id
    WHERE vr.status IN ('pending','under_review','more_info_requested') ORDER BY vr.created_at ASC")->fetchAll();
?>
<h1 class="display">Verification Queue</h1>
<p class="text-muted"><?= count($requests) ?> pending request(s).</p>

<?php if (empty($requests)): ?>
  <div class="empty-state">Queue is clear — no verification requests are waiting for review.</div>
<?php else: ?>
  <table>
    <tr><th>Member</th><th>Country</th><th>Status</th><th>Submitted</th><th></th></tr>
    <?php foreach ($requests as $r): ?>
      <tr>
        <td><?= e($r['first_name'] . ' ' . $r['last_name']) ?></td>
        <td><?= e($r['country_name'] ?? '—') ?></td>
        <td><span class="badge badge-warning"><?= e(str_replace('_', ' ', $r['status'])) ?></span></td>
        <td><?= e(date('M j, Y', strtotime($r['created_at']))) ?></td>
        <td><a href="<?= BASE_URL ?>/admin/verification-review.php?id=<?= $r['id'] ?>">Review</a></td>
      </tr>
    <?php endforeach; ?>
  </table>
<?php endif; ?>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
