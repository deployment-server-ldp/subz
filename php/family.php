<?php
require_once __DIR__ . '/includes/functions.php';
$pageTitle = 'Family Heritage';
$branches = db()->query(
    "SELECT fb.*, (SELECT COUNT(*) FROM family_branch_memberships m WHERE m.branch_id=fb.id AND m.status='approved') AS member_count
     FROM family_branches fb WHERE fb.deleted_at IS NULL ORDER BY fb.name ASC"
)->fetchAll();
require __DIR__ . '/includes/header.php';
?>
<div class="container" style="padding:64px 24px;">
  <h1 class="display">Family Heritage</h1>
  <p class="text-muted">Explore Subzwari family branches, shared ancestry, and community lineage.</p>
  <?php if (empty($branches)): ?>
    <div class="empty-state">No family branches yet. Check back soon.</div>
  <?php else: ?>
    <div class="grid grid-3" style="margin-top:24px;">
      <?php foreach ($branches as $b): ?>
        <a class="card" href="<?= BASE_URL ?>/family-branch.php?slug=<?= e($b['slug']) ?>">
          <strong><?= e($b['name']) ?></strong>
          <?php if ($b['region']): ?><div class="text-muted"><?= e($b['region']) ?></div><?php endif; ?>
          <div class="text-muted"><?= (int) $b['member_count'] ?> members</div>
        </a>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
