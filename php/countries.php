<?php
require_once __DIR__ . '/includes/functions.php';
$pageTitle = 'Subzwari Around the World';
$countries = db()->query(
    "SELECT c.*, (SELECT COUNT(*) FROM profiles p WHERE p.country_id=c.id AND p.verification_status='verified') AS member_count
     FROM countries c ORDER BY display_order ASC"
)->fetchAll();
require __DIR__ . '/includes/header.php';
?>
<div class="container" style="padding:64px 24px;">
  <h1 class="display">Subzwari Around the World</h1>
  <p class="text-muted">Wherever we are in the world, we are connected by one name. Explore verified Subzwari communities by country.</p>
  <?php if (empty($countries)): ?>
    <div class="empty-state">No countries yet — check back soon.</div>
  <?php else: ?>
    <div class="grid grid-3" style="margin-top:24px;">
      <?php foreach ($countries as $c): ?>
        <a class="card" href="<?= BASE_URL ?>/country.php?slug=<?= e($c['slug']) ?>">
          <strong><?= e($c['name']) ?></strong>
          <div class="text-muted"><?= (int) $c['member_count'] ?> verified member<?= $c['member_count'] == 1 ? '' : 's' ?></div>
        </a>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
