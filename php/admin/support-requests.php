<?php
$activeNav = 'support-requests';
$requiredRoles = ['admin', 'content_manager', 'moderator'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $id = (int) $_POST['id'];
    $status = $_POST['status'] === 'approve' ? 'open' : 'rejected';
    db()->prepare('UPDATE support_requests SET status=?, updated_at=NOW() WHERE id=?')->execute([$status, $id]);
    write_audit_log($__user['id'], 'supportRequest.' . $status, 'SupportRequest', (string) $id);
    redirect('/admin/support-requests.php');
}

$requests = db()->query(
    "SELECT sr.*, p.first_name, p.last_name FROM support_requests sr INNER JOIN profiles p ON p.id = sr.requester_id ORDER BY sr.created_at DESC"
)->fetchAll();
$tone = ['pending_review' => 'warning', 'open' => 'accent', 'in_progress' => 'warning', 'resolved' => 'success', 'closed' => 'neutral', 'rejected' => 'danger'];
?>
<h1 class="display">Support Requests</h1>
<?php if (empty($requests)): ?>
  <div class="empty-state">No support requests yet</div>
<?php else: ?>
  <table>
    <tr><th>Title</th><th>Requester</th><th>Category</th><th>Status</th><th></th></tr>
    <?php foreach ($requests as $r): ?>
      <tr>
        <td><?= e($r['title']) ?></td>
        <td><?= e($r['first_name'] . ' ' . $r['last_name']) ?></td>
        <td><?= e(str_replace('_', ' ', $r['category'])) ?></td>
        <td><span class="badge badge-<?= $tone[$r['status']] ?>"><?= e(str_replace('_', ' ', $r['status'])) ?></span></td>
        <td>
          <?php if ($r['status'] === 'pending_review'): ?>
            <form method="post" style="display:flex; gap:4px;">
              <?= csrf_field() ?><input type="hidden" name="id" value="<?= $r['id'] ?>">
              <button type="submit" name="status" value="approve" class="btn btn-primary btn-sm">Approve</button>
              <button type="submit" name="status" value="reject" class="btn btn-danger btn-sm">Reject</button>
            </form>
          <?php endif; ?>
        </td>
      </tr>
    <?php endforeach; ?>
  </table>
<?php endif; ?>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
