<?php
$activeNav = 'connections';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/member_header.php';

$profile = current_profile();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['remove_id'])) {
    require_csrf();
    $id = (int) $_POST['remove_id'];
    db()->prepare('UPDATE connections SET status="removed" WHERE id=? AND (requester_id=? OR recipient_id=?)')
        ->execute([$id, $profile['id'], $profile['id']]);
    redirect('/network/connections.php');
}

$stmt = db()->prepare(
    "SELECT c.*, rp.slug AS requester_slug, rp.first_name AS requester_first, rp.last_name AS requester_last,
        cp.slug AS recipient_slug, cp.first_name AS recipient_first, cp.last_name AS recipient_last
     FROM connections c
     INNER JOIN profiles rp ON rp.id = c.requester_id INNER JOIN profiles cp ON cp.id = c.recipient_id
     WHERE c.status='accepted' AND (c.requester_id=? OR c.recipient_id=?) ORDER BY c.responded_at DESC"
);
$stmt->execute([$profile['id'], $profile['id']]);
$connections = $stmt->fetchAll();
?>
<h1 class="display">My Connections</h1>
<?php if (empty($connections)): ?>
  <div class="empty-state">No connections yet. Discover members and send a connection request.</div>
<?php else: ?>
  <?php foreach ($connections as $c):
    $isRequester = (int) $c['requester_id'] === (int) $profile['id'];
    $otherSlug = $isRequester ? $c['recipient_slug'] : $c['requester_slug'];
    $otherName = $isRequester ? $c['recipient_first'] . ' ' . $c['recipient_last'] : $c['requester_first'] . ' ' . $c['requester_last'];
  ?>
    <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
      <a href="<?= BASE_URL ?>/member.php?slug=<?= e($otherSlug) ?>"><?= e($otherName) ?></a>
      <form method="post">
        <?= csrf_field() ?>
        <input type="hidden" name="remove_id" value="<?= $c['id'] ?>">
        <button type="submit" class="btn btn-secondary btn-sm">Remove</button>
      </form>
    </div>
  <?php endforeach; ?>
<?php endif; ?>
<?php require __DIR__ . '/../includes/member_footer.php'; ?>
