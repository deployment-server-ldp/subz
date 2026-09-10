<?php
require_once __DIR__ . '/includes/functions.php';
$pageTitle = 'Subzwari Moments';

$moments = db()->query(
    "SELECT * FROM moments WHERE status='approved' AND deleted_at IS NULL ORDER BY featured DESC, created_at DESC"
)->fetchAll();

require __DIR__ . '/includes/header.php';
?>
<div class="container" style="padding:64px 24px;">
  <h1 class="display">Subzwari Moments</h1>
  <p class="text-muted">Celebrations, achievements, and community gatherings shared by Subzwari members.</p>
  <?php if (empty($moments)): ?>
    <div class="empty-state">No moments yet. Be the first to share a community moment.</div>
  <?php else: ?>
    <div class="grid grid-4" style="margin-top:24px;">
      <?php foreach ($moments as $m): ?>
        <figure style="margin:0; border:1px solid var(--border); border-radius:var(--radius); overflow:hidden;">
          <img src="<?= e(upload_url($m['image_path'])) ?>" alt="<?= e($m['caption']) ?>" style="width:100%; aspect-ratio:1; object-fit:cover; display:block;">
          <figcaption style="padding:8px; font-size:12px; color:var(--muted-foreground);"><?= e($m['caption']) ?></figcaption>
        </figure>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
