<?php
require_once __DIR__ . '/includes/functions.php';

$stmt = db()->prepare('SELECT * FROM countries WHERE slug = ? LIMIT 1');
$stmt->execute([$_GET['slug'] ?? '']);
$country = $stmt->fetch();
if (!$country) {
    http_response_code(404);
    require __DIR__ . '/includes/header.php';
    echo '<div class="container" style="padding:64px 24px;"><div class="empty-state">Country not found.</div></div>';
    require __DIR__ . '/includes/footer.php';
    exit;
}

$stmt = db()->prepare("SELECT COUNT(*) FROM profiles WHERE country_id=? AND verification_status='verified' AND visibility IN ('public','community')");
$stmt->execute([$country['id']]);
$memberCount = (int) $stmt->fetchColumn();

$citiesStmt = db()->prepare('SELECT * FROM cities WHERE country_id=? ORDER BY name ASC');
$citiesStmt->execute([$country['id']]);
$cities = $citiesStmt->fetchAll();

$stmt = db()->prepare("SELECT COUNT(*) FROM businesses WHERE country_id=? AND status='approved'");
$stmt->execute([$country['id']]);
$businessCount = (int) $stmt->fetchColumn();

$stmt = db()->prepare("SELECT COUNT(DISTINCT p.id) FROM profiles p INNER JOIN profile_professional_categories c ON c.profile_id=p.id WHERE p.country_id=? AND p.verification_status='verified'");
$stmt->execute([$country['id']]);
$professionalCount = (int) $stmt->fetchColumn();

$pageTitle = 'Subzwari in ' . $country['name'];
require __DIR__ . '/includes/header.php';
?>
<div class="container" style="padding:64px 24px;">
  <p class="kicker">SUBZWARI IN</p>
  <h1 class="display" style="font-size:36px;"><?= e($country['name']) ?></h1>
  <?php if ($country['summary']): ?><p class="text-muted"><?= e($country['summary']) ?></p><?php endif; ?>

  <div class="grid grid-4" style="margin-top:24px;">
    <div class="stat"><div class="value"><?= $memberCount ?></div><div class="label">Verified Members</div></div>
    <div class="stat"><div class="value"><?= count($cities) ?></div><div class="label">Cities</div></div>
    <div class="stat"><div class="value"><?= $professionalCount ?></div><div class="label">Professionals</div></div>
    <div class="stat"><div class="value"><?= $businessCount ?></div><div class="label">Businesses</div></div>
  </div>

  <?php if (!empty($cities)): ?>
    <h2 style="text-align:left; margin-top:32px;">Cities</h2>
    <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:12px;">
      <?php foreach ($cities as $city): ?>
        <a class="badge badge-neutral" href="<?= BASE_URL ?>/city.php?slug=<?= e($city['slug']) ?>"><?= e($city['name']) ?></a>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>

  <div style="display:flex; flex-wrap:wrap; gap:12px; margin-top:32px;">
    <a class="card" href="<?= BASE_URL ?>/members.php?country_id=<?= $country['id'] ?>">View members in <?= e($country['name']) ?></a>
    <a class="card" href="<?= BASE_URL ?>/businesses.php?country_id=<?= $country['id'] ?>">View businesses in <?= e($country['name']) ?></a>
    <a class="card" href="<?= BASE_URL ?>/events.php?country_id=<?= $country['id'] ?>">View events in <?= e($country['name']) ?></a>
  </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
