<?php
require_once __DIR__ . '/includes/functions.php';

$stmt = db()->prepare(
    "SELECT e.*, co.name AS country_name, ci.name AS city_name, p.first_name, p.last_name,
        (SELECT COUNT(*) FROM event_attendees WHERE event_id=e.id AND status='going') AS going_count
     FROM events e LEFT JOIN countries co ON co.id=e.country_id LEFT JOIN cities ci ON ci.id=e.city_id
     INNER JOIN profiles p ON p.id = e.organizer_id WHERE e.slug = ? LIMIT 1"
);
$stmt->execute([$_GET['slug'] ?? '']);
$event = $stmt->fetch();

if (!$event || $event['status'] !== 'published') {
    http_response_code(404);
    require __DIR__ . '/includes/header.php';
    echo '<div class="container" style="padding:64px 24px;"><div class="empty-state">Event not found.</div></div>';
    require __DIR__ . '/includes/footer.php';
    exit;
}

$viewer = current_user();
$viewerProfile = current_profile();
$myRsvp = null;
if ($viewerProfile) {
    $stmt = db()->prepare('SELECT status FROM event_attendees WHERE event_id=? AND profile_id=?');
    $stmt->execute([$event['id'], $viewerProfile['id']]);
    $myRsvp = $stmt->fetchColumn() ?: null;
}

$message = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $viewerProfile) {
    require_csrf();
    $status = $_POST['status'];
    if ($status === 'going' && $event['max_capacity'] && $event['going_count'] >= $event['max_capacity'] && $myRsvp !== 'going') {
        $message = 'This event has reached its capacity.';
    } else {
        db()->prepare('INSERT INTO event_attendees (event_id, profile_id, status, created_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE status=VALUES(status)')
            ->execute([$event['id'], $viewerProfile['id'], $status]);
        $myRsvp = $status;
        notify($viewer['id'], 'event_rsvp_confirmed', '/event.php?slug=' . $event['slug']);
    }
}

$pageTitle = $event['name'];
require __DIR__ . '/includes/header.php';
?>
<div class="container-narrow" style="padding:64px 24px;">
  <h1 class="display"><?= e($event['name']) ?></h1>
  <p class="text-muted"><?= e(date('M j, Y g:ia', strtotime($event['starts_at']))) ?></p>
  <p class="text-muted"><?= e(trim(($event['city_name'] ?? '') . ', ' . ($event['country_name'] ?? ''), ', ')) ?: e($event['location'] ?? '') ?></p>
  <p class="text-muted">Organized by <?= e($event['first_name'] . ' ' . $event['last_name']) ?> · <?= (int) $event['going_count'] ?> going<?= $event['max_capacity'] ? ' / ' . $event['max_capacity'] . ' capacity' : '' ?></p>

  <div class="card"><h3>About this event</h3><p class="text-muted"><?= e($event['description']) ?></p></div>

  <?php if ($message): ?><div class="alert alert-error"><?= e($message) ?></div><?php endif; ?>

  <?php if ($viewer): ?>
    <form method="post" style="display:flex; gap:8px; margin-top:16px;">
      <?= csrf_field() ?>
      <button type="submit" name="status" value="going" class="btn btn-primary btn-sm" <?= $myRsvp === 'going' ? 'disabled' : '' ?>><?= $myRsvp === 'going' ? "You're going" : "I'm going" ?></button>
      <button type="submit" name="status" value="interested" class="btn btn-secondary btn-sm" <?= $myRsvp === 'interested' ? 'disabled' : '' ?>>Interested</button>
      <?php if (in_array($myRsvp, ['going', 'interested'], true)): ?>
        <button type="submit" name="status" value="cancelled" class="btn btn-secondary btn-sm">Cancel RSVP</button>
      <?php endif; ?>
    </form>
  <?php else: ?>
    <p class="text-muted"><a href="<?= BASE_URL ?>/login.php">Sign in</a> to RSVP.</p>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
