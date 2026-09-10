<?php
$activeNav = 'requests';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/member_header.php';

$profile = current_profile();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $id = (int) $_POST['connection_id'];
    $stmt = db()->prepare('SELECT * FROM connections WHERE id=? AND recipient_id=? AND status="pending"');
    $stmt->execute([$id, $profile['id']]);
    $connection = $stmt->fetch();
    if ($connection) {
        $newStatus = $_POST['accept'] === '1' ? 'accepted' : 'rejected';
        db()->prepare('UPDATE connections SET status=?, responded_at=NOW() WHERE id=?')->execute([$newStatus, $id]);
        if ($newStatus === 'accepted') {
            $stmt = db()->prepare('SELECT user_id FROM profiles WHERE id=?');
            $stmt->execute([$connection['requester_id']]);
            notify((int) $stmt->fetchColumn(), 'connection_accepted', '/member.php?slug=' . $profile['slug']);
        }
    }
    redirect('/network/requests.php');
}

$stmt = db()->prepare(
    "SELECT c.*, p.first_name, p.last_name FROM connections c INNER JOIN profiles p ON p.id = c.requester_id
     WHERE c.recipient_id=? AND c.status='pending' ORDER BY c.created_at DESC"
);
$stmt->execute([$profile['id']]);
$incoming = $stmt->fetchAll();

$stmt = db()->prepare(
    "SELECT c.*, p.first_name, p.last_name FROM connections c INNER JOIN profiles p ON p.id = c.recipient_id
     WHERE c.requester_id=? AND c.status='pending' ORDER BY c.created_at DESC"
);
$stmt->execute([$profile['id']]);
$outgoing = $stmt->fetchAll();
?>
<h1 class="display">Connection Requests</h1>

<h2 style="font-size:18px;">Incoming</h2>
<?php if (empty($incoming)): ?>
  <div class="empty-state">No incoming requests</div>
<?php else: ?>
  <?php foreach ($incoming as $r): ?>
    <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
      <strong><?= e($r['first_name'] . ' ' . $r['last_name']) ?></strong>
      <form method="post" style="display:flex; gap:4px;">
        <?= csrf_field() ?><input type="hidden" name="connection_id" value="<?= $r['id'] ?>">
        <button type="submit" name="accept" value="1" class="btn btn-primary btn-sm">Accept</button>
        <button type="submit" name="accept" value="0" class="btn btn-secondary btn-sm">Decline</button>
      </form>
    </div>
  <?php endforeach; ?>
<?php endif; ?>

<h2 style="font-size:18px; margin-top:24px;">Sent</h2>
<?php if (empty($outgoing)): ?>
  <div class="empty-state">No pending sent requests</div>
<?php else: ?>
  <?php foreach ($outgoing as $r): ?>
    <div class="card"><span class="text-muted">Waiting on <?= e($r['first_name'] . ' ' . $r['last_name']) ?></span></div>
  <?php endforeach; ?>
<?php endif; ?>
<?php require __DIR__ . '/../includes/member_footer.php'; ?>
