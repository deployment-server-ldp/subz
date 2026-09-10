<?php
$activeNav = 'dashboard';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

$stats = [
    'Total Members' => (int) db()->query('SELECT COUNT(*) FROM profiles')->fetchColumn(),
    'Verified Members' => (int) db()->query("SELECT COUNT(*) FROM profiles WHERE verification_status='verified'")->fetchColumn(),
    'Pending Verification' => (int) db()->query("SELECT COUNT(*) FROM verification_requests WHERE status IN ('pending','under_review','more_info_requested')")->fetchColumn(),
    'Countries' => (int) db()->query('SELECT COUNT(*) FROM countries')->fetchColumn(),
    'Cities' => (int) db()->query('SELECT COUNT(*) FROM cities')->fetchColumn(),
    'Businesses' => (int) db()->query('SELECT COUNT(*) FROM businesses')->fetchColumn(),
    'Events' => (int) db()->query('SELECT COUNT(*) FROM events')->fetchColumn(),
    'Stories' => (int) db()->query('SELECT COUNT(*) FROM stories WHERE deleted_at IS NULL')->fetchColumn(),
    'Moments' => (int) db()->query('SELECT COUNT(*) FROM moments WHERE deleted_at IS NULL')->fetchColumn(),
    'Support Requests' => (int) db()->query('SELECT COUNT(*) FROM support_requests')->fetchColumn(),
    'Open Reports' => (int) db()->query("SELECT COUNT(*) FROM reports WHERE status IN ('open','reviewing')")->fetchColumn(),
];

$recentLogs = db()->query('SELECT al.*, u.email FROM audit_logs al INNER JOIN users u ON u.id = al.actor_id ORDER BY al.created_at DESC LIMIT 10')->fetchAll();
?>
<h1 class="display">Dashboard</h1>
<div class="grid grid-4">
  <?php foreach ($stats as $label => $value): ?>
    <div class="card"><div class="text-muted"><?= e($label) ?></div><div class="display" style="font-size:22px;"><?= $value ?></div></div>
  <?php endforeach; ?>
</div>

<?php if ($stats['Pending Verification'] > 0 || $stats['Open Reports'] > 0): ?>
<div class="card">
  <h3>Needs Attention</h3>
  <?php if ($stats['Pending Verification'] > 0): ?><p><a href="<?= BASE_URL ?>/admin/verification.php"><?= $stats['Pending Verification'] ?> verification request(s) waiting</a></p><?php endif; ?>
  <?php if ($stats['Open Reports'] > 0): ?><p><a href="<?= BASE_URL ?>/admin/reports.php"><?= $stats['Open Reports'] ?> report(s) open</a></p><?php endif; ?>
</div>
<?php endif; ?>

<div class="card">
  <h3>Recent Activity</h3>
  <?php if (empty($recentLogs)): ?>
    <div class="empty-state">No activity yet</div>
  <?php else: ?>
    <table>
      <?php foreach ($recentLogs as $log): ?>
        <tr><td><?= e($log['email']) ?> — <?= e($log['action']) ?></td><td class="text-muted"><?= e($log['created_at']) ?></td></tr>
      <?php endforeach; ?>
    </table>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
