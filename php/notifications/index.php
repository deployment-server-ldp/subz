<?php
$activeNav = 'notifications';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/member_header.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    if (isset($_POST['mark_all'])) {
        db()->prepare('UPDATE notifications SET is_read=1 WHERE recipient_id=?')->execute([$__user['id']]);
    } elseif (isset($_POST['mark_id'])) {
        db()->prepare('UPDATE notifications SET is_read=1 WHERE id=? AND recipient_id=?')->execute([(int) $_POST['mark_id'], $__user['id']]);
    }
    redirect('/notifications/index.php');
}

$labels = [
    'verification_approved' => 'Your verification was approved',
    'verification_rejected' => 'Your verification was not approved',
    'verification_more_info' => 'More information is needed for your verification',
    'connection_request' => 'You have a new connection request',
    'connection_accepted' => 'Your connection request was accepted',
    'event_rsvp_confirmed' => 'Your event RSVP was recorded',
    'story_approved' => 'Your story was published',
    'business_approved' => 'Your business listing was approved',
    'support_request_update' => "There's an update on your support request",
    'admin_announcement' => 'Community announcement',
];

$stmt = db()->prepare('SELECT * FROM notifications WHERE recipient_id=? ORDER BY created_at DESC LIMIT 50');
$stmt->execute([$__user['id']]);
$notifications = $stmt->fetchAll();
?>
<div style="display:flex; justify-content:space-between; align-items:center;">
  <h1 class="display">Notifications</h1>
  <form method="post"><?= csrf_field() ?><input type="hidden" name="mark_all" value="1"><button type="submit" class="btn btn-secondary btn-sm">Mark all read</button></form>
</div>

<?php if (empty($notifications)): ?>
  <div class="empty-state">No notifications yet</div>
<?php else: ?>
  <?php foreach ($notifications as $n): ?>
    <form method="post">
      <?= csrf_field() ?>
      <input type="hidden" name="mark_id" value="<?= $n['id'] ?>">
      <button type="submit" class="card" style="width:100%; text-align:left; border:1px solid var(--border); cursor:pointer; <?= !$n['is_read'] ? 'border-color:var(--accent); background:rgba(31,92,71,.04);' : '' ?>">
        <div style="display:flex; justify-content:space-between;">
          <span style="<?= !$n['is_read'] ? 'font-weight:600;' : '' ?>"><?= e($labels[$n['type']] ?? $n['type']) ?></span>
          <?php if (!$n['is_read']): ?><span style="width:8px; height:8px; border-radius:50%; background:var(--accent); display:inline-block;"></span><?php endif; ?>
        </div>
        <div class="text-muted" style="font-size:12px;"><?= e($n['created_at']) ?></div>
      </button>
    </form>
  <?php endforeach; ?>
<?php endif; ?>
<?php require __DIR__ . '/../includes/member_footer.php'; ?>
