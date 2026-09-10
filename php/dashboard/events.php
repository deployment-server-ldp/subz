<?php
$activeNav = 'events';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/member_header.php';

$profile = current_profile();
$stmt = db()->prepare('SELECT * FROM events WHERE organizer_id=? ORDER BY created_at DESC');
$stmt->execute([$profile['id']]);
$organized = $stmt->fetchAll();

$stmt = db()->prepare("SELECT e.* FROM event_attendees ea INNER JOIN events e ON e.id=ea.event_id WHERE ea.profile_id=? AND ea.status='going' ORDER BY e.starts_at ASC");
$stmt->execute([$profile['id']]);
$attending = $stmt->fetchAll();

$tone = ['draft' => 'neutral', 'pending_approval' => 'warning', 'published' => 'success', 'completed' => 'neutral', 'cancelled' => 'danger'];
?>
<div style="display:flex; justify-content:space-between; align-items:center;">
  <h1 class="display">My Events</h1>
  <a class="btn btn-primary btn-sm" href="<?= BASE_URL ?>/dashboard/events-new.php">Propose an Event</a>
</div>

<h2 style="font-size:18px;">Organized by me</h2>
<?php if (empty($organized)): ?>
  <div class="empty-state">No events proposed yet</div>
<?php else: ?>
  <?php foreach ($organized as $ev): ?>
    <div class="card" style="display:flex; justify-content:space-between;">
      <div><strong><?= e($ev['name']) ?></strong><div class="text-muted"><?= e(date('M j, Y g:ia', strtotime($ev['starts_at']))) ?></div></div>
      <span class="badge badge-<?= $tone[$ev['status']] ?>"><?= e(str_replace('_', ' ', $ev['status'])) ?></span>
    </div>
  <?php endforeach; ?>
<?php endif; ?>

<h2 style="font-size:18px; margin-top:24px;">Attending</h2>
<?php if (empty($attending)): ?>
  <div class="empty-state">No upcoming RSVPs</div>
<?php else: ?>
  <?php foreach ($attending as $ev): ?>
    <div class="card"><strong><?= e($ev['name']) ?></strong><div class="text-muted"><?= e(date('M j, Y g:ia', strtotime($ev['starts_at']))) ?></div></div>
  <?php endforeach; ?>
<?php endif; ?>
<?php require __DIR__ . '/../includes/member_footer.php'; ?>
