<?php
require_once __DIR__ . '/includes/functions.php';
$pageTitle = 'Subzwari Stories';

$stories = db()->query(
    "SELECT s.*, sc.name AS category_name FROM stories s LEFT JOIN story_categories sc ON sc.id = s.category_id
     WHERE s.deleted_at IS NULL AND (s.status = 'published' OR (s.status = 'scheduled' AND s.scheduled_at <= NOW()))
     ORDER BY s.featured DESC, s.published_at DESC"
)->fetchAll();

require __DIR__ . '/includes/header.php';
?>
<div class="container" style="padding:64px 24px;">
  <h1 class="display">Subzwari Stories</h1>
  <p class="text-muted">Heritage, achievement, and community stories from Subzwari around the world.</p>
  <?php if (empty($stories)): ?>
    <div class="empty-state">No stories published yet</div>
  <?php else: ?>
    <div class="grid grid-3" style="margin-top:24px;">
      <?php foreach ($stories as $s): ?>
        <a class="card" href="<?= BASE_URL ?>/story.php?slug=<?= e($s['slug']) ?>">
          <?php if ($s['featured']): ?><div class="text-muted" style="text-transform:uppercase; font-size:11px; color:var(--accent);">Featured</div><?php endif; ?>
          <strong><?= e($s['title']) ?></strong>
          <?php if ($s['category_name']): ?><div class="text-muted" style="font-size:12px;"><?= e($s['category_name']) ?></div><?php endif; ?>
          <?php if ($s['excerpt']): ?><p class="text-muted"><?= e($s['excerpt']) ?></p><?php endif; ?>
        </a>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
