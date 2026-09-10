<?php
$activeNav = 'support';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/member_header.php';

$profile = current_profile();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['offer_help_id'])) {
    require_csrf();
    $requestId = (int) $_POST['offer_help_id'];
    $message = trim($_POST['message'] ?? '');
    $stmt = db()->prepare('SELECT * FROM support_requests WHERE id=? AND status="open"');
    $stmt->execute([$requestId]);
    $request = $stmt->fetch();
    if ($request && (int) $request['requester_id'] !== (int) $profile['id'] && $message !== '') {
        db()->prepare('INSERT IGNORE INTO support_offers (support_request_id, helper_id, message, created_at) VALUES (?, ?, ?, NOW())')
            ->execute([$requestId, $profile['id'], $message]);
        db()->prepare('UPDATE support_requests SET status="in_progress", updated_at=NOW() WHERE id=?')->execute([$requestId]);
        $requesterProfile = db()->prepare('SELECT user_id FROM profiles WHERE id=?');
        $requesterProfile->execute([$request['requester_id']]);
        notify((int) $requesterProfile->fetchColumn(), 'support_request_update', '/dashboard/support.php');
        flash('success', 'Your offer has been sent.');
    }
    redirect('/dashboard/support.php');
}

$stmt = db()->prepare('SELECT * FROM support_requests WHERE requester_id=? ORDER BY created_at DESC');
$stmt->execute([$profile['id']]);
$myRequests = $stmt->fetchAll();
foreach ($myRequests as &$r) {
    $stmt2 = db()->prepare('SELECT so.*, p.first_name, p.last_name FROM support_offers so INNER JOIN profiles p ON p.id = so.helper_id WHERE support_request_id=?');
    $stmt2->execute([$r['id']]);
    $r['offers'] = $stmt2->fetchAll();
}
unset($r);

$stmt = db()->prepare(
    "SELECT sr.*, p.first_name, p.last_name FROM support_requests sr INNER JOIN profiles p ON p.id = sr.requester_id
     WHERE sr.status='open' AND sr.requester_id != ? AND sr.visibility IN ('public','community') ORDER BY sr.created_at DESC LIMIT 20"
);
$stmt->execute([$profile['id']]);
$openRequests = $stmt->fetchAll();

$tone = ['pending_review' => 'warning', 'open' => 'accent', 'in_progress' => 'warning', 'resolved' => 'success', 'closed' => 'neutral', 'rejected' => 'danger'];
?>
<div style="display:flex; justify-content:space-between; align-items:center;">
  <h1 class="display">Community Support</h1>
  <a class="btn btn-primary btn-sm" href="<?= BASE_URL ?>/dashboard/support-new.php">Request Support</a>
</div>

<h2 style="font-size:18px;">My Requests</h2>
<?php if (empty($myRequests)): ?>
  <div class="empty-state">No support requests yet</div>
<?php else: ?>
  <?php foreach ($myRequests as $r): ?>
    <div class="card">
      <div style="display:flex; justify-content:space-between;">
        <strong><?= e($r['title']) ?></strong>
        <span class="badge badge-<?= $tone[$r['status']] ?>"><?= e(str_replace('_', ' ', $r['status'])) ?></span>
      </div>
      <div class="text-muted"><?= e(str_replace('_', ' ', $r['category'])) ?></div>
      <?php if (!empty($r['offers'])): ?>
        <div style="border-top:1px solid var(--border); margin-top:8px; padding-top:8px;">
          <strong style="font-size:13px;">Offers to help</strong>
          <?php foreach ($r['offers'] as $offer): ?>
            <p class="text-muted"><?= e($offer['first_name'] . ' ' . $offer['last_name']) ?>: <?= e($offer['message']) ?></p>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </div>
  <?php endforeach; ?>
<?php endif; ?>

<h2 style="font-size:18px; margin-top:24px;">Requests You Could Help With</h2>
<?php if (empty($openRequests)): ?>
  <div class="empty-state">No open requests right now</div>
<?php else: ?>
  <?php foreach ($openRequests as $r): ?>
    <div class="card">
      <strong><?= e($r['title']) ?></strong>
      <div class="text-muted"><?= e(str_replace('_', ' ', $r['category'])) ?> · from <?= e($r['first_name'] . ' ' . $r['last_name']) ?></div>
      <p class="text-muted"><?= e($r['description']) ?></p>
      <details>
        <summary class="btn btn-secondary btn-sm" style="display:inline-block; cursor:pointer;">Offer to Help</summary>
        <form method="post" style="margin-top:8px;">
          <?= csrf_field() ?>
          <input type="hidden" name="offer_help_id" value="<?= $r['id'] ?>">
          <textarea name="message" rows="3" placeholder="How can you help?" required></textarea>
          <button type="submit" class="btn btn-primary btn-sm" style="margin-top:8px;">Send offer</button>
        </form>
      </details>
    </div>
  <?php endforeach; ?>
<?php endif; ?>
<?php require __DIR__ . '/../includes/member_footer.php'; ?>
