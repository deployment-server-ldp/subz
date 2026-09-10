<?php
require_once __DIR__ . '/includes/functions.php';

$slug = $_GET['slug'] ?? '';
$viewer = current_user();
$viewerProfile = current_profile();
$profile = get_visible_profile_by_slug($slug, (bool) $viewer, $viewerProfile['id'] ?? null);

if (!$profile) {
    http_response_code(404);
    require __DIR__ . '/includes/header.php';
    echo '<div class="container" style="padding:64px 24px;"><div class="empty-state">Profile not found.</div></div>';
    require __DIR__ . '/includes/footer.php';
    exit;
}

$isOwner = $viewerProfile && (int) $viewerProfile['id'] === (int) $profile['id'];
$stmt = db()->prepare('SELECT pc.name FROM profile_professional_categories ppc INNER JOIN professional_categories pc ON pc.id = ppc.category_id WHERE ppc.profile_id = ?');
$stmt->execute([$profile['id']]);
$categories = array_column($stmt->fetchAll(), 'name');

$connectMessage = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $viewer && !$isOwner) {
    require_csrf();
    $action = $_POST['action'] ?? '';
    if ($action === 'connect') {
        $exists = db()->prepare("SELECT id FROM connections WHERE status IN ('pending','accepted') AND ((requester_id=? AND recipient_id=?) OR (requester_id=? AND recipient_id=?))");
        $exists->execute([$viewerProfile['id'], $profile['id'], $profile['id'], $viewerProfile['id']]);
        if ($exists->fetch()) {
            $connectMessage = 'A connection already exists or is pending.';
        } else {
            db()->prepare('INSERT INTO connections (requester_id, recipient_id, status, created_at) VALUES (?, ?, "pending", NOW())')
                ->execute([$viewerProfile['id'], $profile['id']]);
            $notifyStmt = db()->prepare('SELECT user_id FROM profiles WHERE id=?');
            $notifyStmt->execute([$profile['id']]);
            notify((int) $notifyStmt->fetchColumn(), 'connection_request', '/network/requests.php');
            $connectMessage = 'Connection request sent.';
        }
    } elseif ($action === 'contact') {
        $message = trim($_POST['message'] ?? '');
        if ($message !== '') {
            db()->prepare('INSERT INTO contact_requests (from_id, to_id, message, created_at) VALUES (?, ?, ?, NOW())')
                ->execute([$viewerProfile['id'], $profile['id'], $message]);
            $connectMessage = 'Your message has been sent.';
        }
    } elseif ($action === 'report') {
        $reason = $_POST['reason'] ?? 'other';
        $details = trim($_POST['details'] ?? '');
        db()->prepare('INSERT INTO reports (reporter_id, target_type, target_id, reason, details, created_at, updated_at) VALUES (?, "profile", ?, ?, ?, NOW(), NOW())')
            ->execute([$viewer['id'], $profile['id'], $reason, $details ?: null]);
        $connectMessage = 'Thanks — our team will review this.';
    }
}

$pageTitle = $profile['first_name'] . ' ' . $profile['last_name'];
require __DIR__ . '/includes/header.php';
?>
<div class="container-narrow" style="padding:64px 24px;">
  <h1 class="display"><?= e($profile['first_name'] . ' ' . $profile['last_name']) ?></h1>
  <p class="text-muted"><?= e(trim(($profile['city_name'] ?? '') . ', ' . ($profile['country_name'] ?? ''), ', ')) ?: 'Location not set' ?></p>
  <?php if ($profile['profession']): ?><p class="text-muted"><?= e($profile['profession']) ?></p><?php endif; ?>
  <?php if ($profile['verification_status'] === 'verified'): ?><span class="badge badge-verified">✓ Verified</span><?php endif; ?>

  <?php if ($profile['bio']): ?>
    <div class="card"><h3>About</h3><p class="text-muted"><?= e($profile['bio']) ?></p></div>
  <?php endif; ?>

  <?php if ($profile['company'] || $profile['industry'] || $profile['education'] || $categories): ?>
    <div class="card">
      <h3>Professional</h3>
      <?php if ($profile['company']): ?><p><strong>Company:</strong> <?= e($profile['company']) ?></p><?php endif; ?>
      <?php if ($profile['industry']): ?><p><strong>Industry:</strong> <?= e($profile['industry']) ?></p><?php endif; ?>
      <?php if ($profile['education']): ?><p><strong>Education:</strong> <?= e($profile['education']) ?></p><?php endif; ?>
      <?php foreach ($categories as $cat): ?><span class="badge badge-neutral"><?= e($cat) ?></span> <?php endforeach; ?>
    </div>
  <?php endif; ?>

  <?php if ($profile['ancestral_region']): ?>
    <div class="card"><h3>Family</h3><p class="text-muted">Ancestral region: <?= e($profile['ancestral_region']) ?></p></div>
  <?php endif; ?>

  <?php if ($connectMessage): ?><div class="alert alert-success"><?= e($connectMessage) ?></div><?php endif; ?>

  <?php if (!$isOwner && $viewer): ?>
    <div class="card">
      <form method="post" style="display:inline;">
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="connect">
        <button type="submit" class="btn btn-primary btn-sm">Connect</button>
      </form>
      <details style="display:inline-block; margin-left:8px;">
        <summary class="btn btn-secondary btn-sm" style="display:inline-block; cursor:pointer;">Request Introduction</summary>
        <form method="post" style="margin-top:12px;">
          <?= csrf_field() ?>
          <input type="hidden" name="action" value="contact">
          <textarea name="message" rows="3" placeholder="Introduce yourself…" required></textarea>
          <button type="submit" class="btn btn-primary btn-sm" style="margin-top:8px;">Send</button>
        </form>
      </details>
      <details style="margin-top:12px;">
        <summary class="text-muted" style="cursor:pointer; font-size:13px;">Report this profile</summary>
        <form method="post" style="margin-top:8px;">
          <?= csrf_field() ?>
          <input type="hidden" name="action" value="report">
          <select name="reason">
            <option value="fake_profile">Fake profile</option>
            <option value="incorrect_information">Incorrect information</option>
            <option value="harassment">Harassment</option>
            <option value="spam">Spam</option>
            <option value="inappropriate_content">Inappropriate content</option>
            <option value="privacy_concern">Privacy concern</option>
            <option value="other">Other</option>
          </select>
          <textarea name="details" rows="2" placeholder="Additional details (optional)"></textarea>
          <button type="submit" class="btn btn-danger btn-sm" style="margin-top:8px;">Submit report</button>
        </form>
      </details>
    </div>
  <?php elseif (!$viewer): ?>
    <p class="text-muted"><a href="<?= BASE_URL ?>/login.php">Sign in</a> to connect with this member.</p>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
