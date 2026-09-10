<?php
$activeNav = 'events';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

$events = db()->query(
    "SELECT e.*, p.first_name, p.last_name FROM events e INNER JOIN profiles p ON p.id = e.organizer_id ORDER BY e.created_at DESC"
)->fetchAll();
$tone = ['draft' => 'neutral', 'pending_approval' => 'warning', 'published' => 'success', 'completed' => 'neutral', 'cancelled' => 'danger'];
?>
<h1 class="display">Events</h1>
<?php if (empty($events)): ?>
  <div class="empty-state">No events yet</div>
<?php else: ?>
  <table>
    <tr><th>Name</th><th>Organizer</th><th>Starts</th><th>Status</th><th></th></tr>
    <?php foreach ($events as $ev): ?>
      <tr>
        <td><?= e($ev['name']) ?></td>
        <td><?= e($ev['first_name'] . ' ' . $ev['last_name']) ?></td>
        <td><?= e(date('M j, Y', strtotime($ev['starts_at']))) ?></td>
        <td><span class="badge badge-<?= $tone[$ev['status']] ?>"><?= e(str_replace('_', ' ', $ev['status'])) ?></span></td>
        <td><a href="<?= BASE_URL ?>/admin/event-review.php?id=<?= $ev['id'] ?>">Review</a></td>
      </tr>
    <?php endforeach; ?>
  </table>
<?php endif; ?>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
