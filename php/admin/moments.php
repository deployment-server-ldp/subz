<?php
$activeNav = 'moments';
$requiredRoles = ['admin', 'content_manager', 'moderator'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $id = (int) $_POST['id'];
    if (isset($_POST['status'])) {
        db()->prepare('UPDATE moments SET status=?, updated_at=NOW() WHERE id=?')->execute([$_POST['status'], $id]);
        write_audit_log($__user['id'], 'moment.' . $_POST['status'], 'Moment', (string) $id);
    } elseif (isset($_POST['toggle_featured'])) {
        db()->prepare('UPDATE moments SET featured = NOT featured, updated_at=NOW() WHERE id=?')->execute([$id]);
        write_audit_log($__user['id'], 'moment.toggleFeatured', 'Moment', (string) $id);
    }
    redirect('/admin/moments.php');
}

$moments = db()->query(
    "SELECT m.*, p.first_name, p.last_name FROM moments m INNER JOIN profiles p ON p.id = m.submitted_by_id
     WHERE m.deleted_at IS NULL ORDER BY m.created_at DESC"
)->fetchAll();
$tone = ['pending' => 'warning', 'approved' => 'success', 'rejected' => 'danger', 'suspended' => 'danger'];
?>
<h1 class="display">Moments</h1>
<?php if (empty($moments)): ?>
  <div class="empty-state">No moments submitted yet</div>
<?php else: ?>
  <?php foreach ($moments as $m): ?>
    <div class="card" style="display:flex; gap:16px; align-items:flex-start; justify-content:space-between;">
      <div style="display:flex; gap:16px;">
        <img src="<?= e(upload_url($m['image_path'])) ?>" alt="" style="width:80px; height:80px; object-fit:cover; border-radius:6px;">
        <div>
          <strong><?= e($m['caption']) ?></strong>
          <div class="text-muted"><?= e($m['first_name'] . ' ' . $m['last_name']) ?> · <?= e(str_replace('_', ' ', $m['type'])) ?></div>
          <span class="badge badge-<?= $tone[$m['status']] ?>"><?= e($m['status']) ?></span>
        </div>
      </div>
      <div style="text-align:right;">
        <form method="post" style="display:flex; gap:4px; margin-bottom:8px;">
          <?= csrf_field() ?><input type="hidden" name="id" value="<?= $m['id'] ?>">
          <?php if ($m['status'] !== 'approved'): ?><button type="submit" name="status" value="approved" class="btn btn-primary btn-sm">Approve</button><?php endif; ?>
          <?php if ($m['status'] !== 'rejected'): ?><button type="submit" name="status" value="rejected" class="btn btn-danger btn-sm">Reject</button><?php endif; ?>
        </form>
        <?php if ($m['status'] === 'approved'): ?>
          <form method="post">
            <?= csrf_field() ?><input type="hidden" name="id" value="<?= $m['id'] ?>"><input type="hidden" name="toggle_featured" value="1">
            <button type="submit" class="btn btn-secondary btn-sm"><?= $m['featured'] ? 'Unfeature' : 'Feature' ?></button>
          </form>
        <?php endif; ?>
      </div>
    </div>
  <?php endforeach; ?>
<?php endif; ?>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
