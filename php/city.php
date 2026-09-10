<?php
require_once __DIR__ . '/includes/functions.php';

// City slugs are unique per-country, not globally; this takes the first
// match, which is correct as long as admin-entered city names avoid
// cross-country slug collisions (same documented limitation as the schema).
$stmt = db()->prepare('SELECT ci.*, co.name AS country_name, co.slug AS country_slug FROM cities ci INNER JOIN countries co ON co.id = ci.country_id WHERE ci.slug = ? LIMIT 1');
$stmt->execute([$_GET['slug'] ?? '']);
$city = $stmt->fetch();
if (!$city) {
    http_response_code(404);
    require __DIR__ . '/includes/header.php';
    echo '<div class="container" style="padding:64px 24px;"><div class="empty-state">City not found.</div></div>';
    require __DIR__ . '/includes/footer.php';
    exit;
}

$stmt = db()->prepare("SELECT COUNT(*) FROM profiles WHERE city_id=? AND verification_status='verified' AND visibility IN ('public','community')");
$stmt->execute([$city['id']]);
$memberCount = (int) $stmt->fetchColumn();

$stmt = db()->prepare("SELECT COUNT(*) FROM businesses WHERE city_id=? AND status='approved'");
$stmt->execute([$city['id']]);
$businessCount = (int) $stmt->fetchColumn();

$pageTitle = 'Subzwari in ' . $city['name'];
require __DIR__ . '/includes/header.php';
?>
<div class="container" style="padding:64px 24px;">
  <p class="kicker"><a href="<?= BASE_URL ?>/country.php?slug=<?= e($city['country_slug']) ?>"><?= e($city['country_name']) ?></a></p>
  <h1 class="display" style="font-size:36px;">Subzwari in <?= e($city['name']) ?></h1>
  <div class="grid grid-3" style="margin-top:24px;">
    <div class="stat"><div class="value"><?= $memberCount ?></div><div class="label">Verified Members</div></div>
    <div class="stat"><div class="value"><?= $businessCount ?></div><div class="label">Businesses</div></div>
  </div>
  <div style="display:flex; gap:16px; margin-top:24px;">
    <a href="<?= BASE_URL ?>/members.php?city_id=<?= $city['id'] ?>">View members in <?= e($city['name']) ?></a>
    <a href="<?= BASE_URL ?>/businesses.php?city_id=<?= $city['id'] ?>">View businesses in <?= e($city['name']) ?></a>
  </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
