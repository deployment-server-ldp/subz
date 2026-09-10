<?php
$activeNav = 'audit-logs';
$requiredRoles = ['admin'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

$action = trim($_GET['action'] ?? '');
$page = max(1, (int) ($_GET['page'] ?? 1));

$where = '';
$params = [];
if ($action !== '') {
    $where = 'WHERE al.action LIKE ?';
    $params[] = "%$action%";
}

$countStmt = db()->prepare("SELECT COUNT(*) FROM audit_logs al $where");
$countStmt->execute($params);
$total = (int) $countStmt->fetchColumn();
$pagination = paginate($page, $total, 30);

$stmt = db()->prepare("SELECT al.*, u.email FROM audit_logs al INNER JOIN users u ON u.id = al.actor_id $where ORDER BY al.created_at DESC LIMIT {$pagination['perPage']} OFFSET {$pagination['offset']}");
$stmt->execute($params);
$logs = $stmt->fetchAll();
?>
<h1 class="display">Audit Logs</h1>
<form method="get" class="field-row" style="align-items:flex-end;">
  <div class="field"><label>Filter by action</label><input type="text" name="action" value="<?= e($action) ?>" placeholder="e.g. verification.approved"></div>
  <div class="field"><button type="submit" class="btn btn-primary btn-sm">Filter</button></div>
</form>

<?php if (empty($logs)): ?>
  <div class="empty-state">No audit log entries</div>
<?php else: ?>
  <table>
    <tr><th>Actor</th><th>Action</th><th>Target</th><th>When</th></tr>
    <?php foreach ($logs as $log): ?>
      <tr>
        <td><?= e($log['email']) ?></td>
        <td><?= e($log['action']) ?></td>
        <td><?= e($log['target_type']) ?><?= $log['target_id'] ? ': ' . e($log['target_id']) : '' ?></td>
        <td><?= e($log['created_at']) ?></td>
      </tr>
    <?php endforeach; ?>
  </table>
<?php endif; ?>

<div class="pagination">
  <?php for ($i = 1; $i <= $pagination['totalPages']; $i++): ?>
    <a href="?<?= query_string_with(['page' => $i]) ?>" class="<?= $i === $pagination['page'] ? 'active' : '' ?>"><?= $i ?></a>
  <?php endfor; ?>
</div>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
