<?php
$activeNav = 'reports';
$requiredRoles = ['admin', 'moderator'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

function resolve_report_label(string $targetType, int $targetId): string
{
    switch ($targetType) {
        case 'profile':
            $stmt = db()->prepare('SELECT first_name, last_name FROM profiles WHERE id=?');
            $stmt->execute([$targetId]);
            $row = $stmt->fetch();
            return $row ? $row['first_name'] . ' ' . $row['last_name'] : 'Unknown profile';
        case 'business':
            $stmt = db()->prepare('SELECT name FROM businesses WHERE id=?');
            $stmt->execute([$targetId]);
            return $stmt->fetchColumn() ?: 'Unknown business';
        case 'story':
            $stmt = db()->prepare('SELECT title FROM stories WHERE id=?');
            $stmt->execute([$targetId]);
            return $stmt->fetchColumn() ?: 'Unknown story';
        case 'event':
            $stmt = db()->prepare('SELECT name FROM events WHERE id=?');
            $stmt->execute([$targetId]);
            return $stmt->fetchColumn() ?: 'Unknown event';
        case 'support_request':
            $stmt = db()->prepare('SELECT title FROM support_requests WHERE id=?');
            $stmt->execute([$targetId]);
            return $stmt->fetchColumn() ?: 'Unknown request';
        default:
            return 'Moment #' . $targetId;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $id = (int) $_POST['id'];
    $status = $_POST['status'];
    db()->prepare('UPDATE reports SET status=?, resolved_by_id=?, updated_at=NOW() WHERE id=?')->execute([$status, $__user['id'], $id]);
    write_audit_log($__user['id'], 'report.' . $status, 'Report', (string) $id);
    redirect('/admin/reports.php');
}

$reports = db()->query('SELECT r.*, u.email AS reporter_email FROM reports r INNER JOIN users u ON u.id = r.reporter_id ORDER BY r.created_at DESC')->fetchAll();
$tone = ['open' => 'warning', 'reviewing' => 'warning', 'resolved' => 'success', 'dismissed' => 'neutral'];
?>
<h1 class="display">Reports</h1>
<?php if (empty($reports)): ?>
  <div class="empty-state">No reports</div>
<?php else: ?>
  <table>
    <tr><th>Target</th><th>Reason</th><th>Reporter</th><th>Status</th><th></th></tr>
    <?php foreach ($reports as $r): ?>
      <tr>
        <td><?= e(ucfirst($r['target_type'])) ?>: <?= e(resolve_report_label($r['target_type'], (int) $r['target_id'])) ?></td>
        <td><?= e(str_replace('_', ' ', $r['reason'])) ?></td>
        <td><?= e($r['reporter_email']) ?></td>
        <td><span class="badge badge-<?= $tone[$r['status']] ?>"><?= e($r['status']) ?></span></td>
        <td>
          <?php if (in_array($r['status'], ['open', 'reviewing'], true)): ?>
            <form method="post" style="display:flex; gap:4px;">
              <?= csrf_field() ?><input type="hidden" name="id" value="<?= $r['id'] ?>">
              <button type="submit" name="status" value="resolved" class="btn btn-primary btn-sm">Resolve</button>
              <button type="submit" name="status" value="dismissed" class="btn btn-secondary btn-sm">Dismiss</button>
            </form>
          <?php endif; ?>
        </td>
      </tr>
    <?php endforeach; ?>
  </table>
<?php endif; ?>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
