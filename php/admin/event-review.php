<?php
$activeNav = 'events';
$requiredRoles = ['admin', 'content_manager', 'regional_coordinator'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

$id = (int) ($_GET['id'] ?? 0);
$stmt = db()->prepare(
    "SELECT e.*, p.first_name, p.last_name, (SELECT COUNT(*) FROM event_attendees WHERE event_id=e.id) AS rsvp_count
     FROM events e INNER JOIN profiles p ON p.id = e.organizer_id WHERE e.id = ? LIMIT 1"
);
$stmt->execute([$id]);
$event = $stmt->fetch();
if (!$event) {
    http_response_code(404);
    die('Event not found.');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $newStatus = $_POST['decision'] === 'approve' ? 'published' : 'cancelled';
    db()->prepare('UPDATE events SET status=?, updated_at=NOW() WHERE id=?')->execute([$newStatus, $id]);
    write_audit_log($__user['id'], 'event.' . $newStatus, 'Event', (string) $id);
    flash('success', 'Decision recorded.');
    redirect('/admin/events.php');
}
?>
<h1 class="display"><?= e($event['name']) ?></h1>
<span class="badge badge-warning"><?= e(str_replace('_', ' ', $event['status'])) ?></span>

<div class="card" style="max-width:560px;">
  <table>
    <tr><td>Organizer</td><td><?= e($event['first_name'] . ' ' . $event['last_name']) ?></td></tr>
    <tr><td>Starts</td><td><?= e(date('M j, Y g:ia', strtotime($event['starts_at']))) ?></td></tr>
    <tr><td>Location</td><td><?= e($event['location'] ?? '—') ?></td></tr>
    <tr><td>RSVPs</td><td><?= (int) $event['rsvp_count'] ?><?= $event['max_capacity'] ? ' / ' . $event['max_capacity'] : '' ?></td></tr>
    <tr><td>Description</td><td><?= e($event['description']) ?></td></tr>
  </table>
</div>

<form method="post" style="display:flex; gap:8px;">
  <?= csrf_field() ?>
  <button type="submit" name="decision" value="approve" class="btn btn-primary btn-sm">Approve</button>
  <button type="submit" name="decision" value="reject" class="btn btn-danger btn-sm">Reject</button>
</form>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
