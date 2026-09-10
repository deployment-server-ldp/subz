<?php
require_once __DIR__ . '/includes/functions.php';
$pageTitle = 'Community Events';
$countryId = $_GET['country_id'] ?? '';

$where = ["e.status = 'published'", 'e.starts_at >= NOW()'];
$params = [];
if ($countryId !== '') { $where[] = 'e.country_id = ?'; $params[] = $countryId; }
$whereSql = 'WHERE ' . implode(' AND ', $where);

$stmt = db()->prepare(
    "SELECT e.*, co.name AS country_name, ci.name AS city_name, (SELECT COUNT(*) FROM event_attendees WHERE event_id=e.id AND status='going') AS going_count
     FROM events e LEFT JOIN countries co ON co.id=e.country_id LEFT JOIN cities ci ON ci.id=e.city_id
     $whereSql ORDER BY e.starts_at ASC"
);
$stmt->execute($params);
$events = $stmt->fetchAll();

require __DIR__ . '/includes/header.php';
?>
<div class="container" style="padding:64px 24px;">
  <h1 class="display">Community Events</h1>
  <p class="text-muted">Upcoming Subzwari community events around the world.</p>

  <?php if (empty($events)): ?>
    <div class="empty-state">No upcoming events. Check back soon, or propose one yourself.</div>
  <?php else: ?>
    <div class="grid grid-3" style="margin-top:24px;">
      <?php foreach ($events as $ev): ?>
        <a class="card" href="<?= BASE_URL ?>/event.php?slug=<?= e($ev['slug']) ?>">
          <strong><?= e($ev['name']) ?></strong>
          <div class="text-muted"><?= e(date('M j, Y g:ia', strtotime($ev['starts_at']))) ?></div>
          <div class="text-muted"><?= e(trim(($ev['city_name'] ?? '') . ', ' . ($ev['country_name'] ?? ''), ', ')) ?: e($ev['location'] ?? '') ?></div>
          <div class="text-muted" style="font-size:12px; margin-top:4px;"><?= (int) $ev['going_count'] ?> going</div>
        </a>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
