<?php
$activeNav = 'stories';
$requiredRoles = ['admin', 'content_manager'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

$stories = db()->query(
    "SELECT s.*, p.first_name, p.last_name FROM stories s LEFT JOIN profiles p ON p.id = s.author_id WHERE s.deleted_at IS NULL ORDER BY s.created_at DESC"
)->fetchAll();
$tone = ['draft' => 'neutral', 'pending_review' => 'warning', 'published' => 'success', 'scheduled' => 'accent', 'rejected' => 'danger', 'archived' => 'neutral'];
?>
<div style="display:flex; justify-content:space-between; align-items:center;">
  <h1 class="display">Stories</h1>
  <a class="btn btn-primary btn-sm" href="<?= BASE_URL ?>/admin/story-edit.php">New Story</a>
</div>
<?php if (empty($stories)): ?>
  <div class="empty-state">No stories yet</div>
<?php else: ?>
  <table>
    <tr><th>Title</th><th>Author</th><th>Status</th><th>Featured</th><th></th></tr>
    <?php foreach ($stories as $s): ?>
      <tr>
        <td><?= e($s['title']) ?></td>
        <td><?= $s['first_name'] ? e($s['first_name'] . ' ' . $s['last_name']) : 'Editorial' ?></td>
        <td><span class="badge badge-<?= $tone[$s['status']] ?? 'neutral' ?>"><?= e(str_replace('_', ' ', $s['status'])) ?></span></td>
        <td><?= $s['featured'] ? 'Yes' : '—' ?></td>
        <td><a href="<?= BASE_URL ?>/admin/story-edit.php?id=<?= $s['id'] ?>">Edit</a></td>
      </tr>
    <?php endforeach; ?>
  </table>
<?php endif; ?>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
