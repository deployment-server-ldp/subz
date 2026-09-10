<?php
require_once __DIR__ . '/includes/functions.php';
$pageTitle = 'Community';
$sections = [
    ['members.php', 'Member Directory', 'Find verified Subzwari members worldwide.'],
    ['professionals.php', 'Professional Network', 'Connect with Subzwari professionals.'],
    ['businesses.php', 'Businesses', 'Discover Subzwari-owned businesses.'],
    ['countries.php', 'Countries', 'Explore regional Subzwari communities.'],
    ['family.php', 'Family Heritage', 'Family branches and shared lineage.'],
    ['stories.php', 'Stories', 'Heritage, achievement, and community stories.'],
    ['moments.php', 'Moments', 'Celebrations and community gatherings.'],
    ['events.php', 'Events', 'Upcoming community events.'],
];
require __DIR__ . '/includes/header.php';
?>
<div class="container" style="padding:64px 24px;">
  <h1 class="display">Community</h1>
  <p class="text-muted">Wherever we are in the world, we are connected by one name. Explore every part of the SUBZWARI Global Network community.</p>
  <div class="grid grid-3" style="margin-top:32px;">
    <?php foreach ($sections as [$href, $label, $desc]): ?>
      <a class="card" href="<?= BASE_URL . '/' . $href ?>">
        <strong><?= e($label) ?></strong>
        <p class="text-muted"><?= e($desc) ?></p>
      </a>
    <?php endforeach; ?>
  </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
