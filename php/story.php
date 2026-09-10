<?php
require_once __DIR__ . '/includes/functions.php';

$stmt = db()->prepare(
    "SELECT s.*, sc.name AS category_name, p.first_name, p.last_name FROM stories s
     LEFT JOIN story_categories sc ON sc.id = s.category_id LEFT JOIN profiles p ON p.id = s.author_id
     WHERE s.slug = ? LIMIT 1"
);
$stmt->execute([$_GET['slug'] ?? '']);
$story = $stmt->fetch();

$isVisible = $story && !$story['deleted_at'] && ($story['status'] === 'published' || ($story['status'] === 'scheduled' && $story['scheduled_at'] && strtotime($story['scheduled_at']) <= time()));
if (!$isVisible) {
    http_response_code(404);
    require __DIR__ . '/includes/header.php';
    echo '<div class="container" style="padding:64px 24px;"><div class="empty-state">Story not found.</div></div>';
    require __DIR__ . '/includes/footer.php';
    exit;
}

$stmt = db()->prepare('SELECT t.name FROM story_tags st INNER JOIN tags t ON t.id = st.tag_id WHERE st.story_id=?');
$stmt->execute([$story['id']]);
$tags = array_column($stmt->fetchAll(), 'name');

$viewer = current_user();
$reportMessage = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $viewer) {
    require_csrf();
    db()->prepare('INSERT INTO reports (reporter_id, target_type, target_id, reason, details, created_at, updated_at) VALUES (?, "story", ?, ?, ?, NOW(), NOW())')
        ->execute([$viewer['id'], $story['id'], $_POST['reason'] ?? 'other', trim($_POST['details'] ?? '') ?: null]);
    $reportMessage = 'Thanks — our team will review this.';
}

$pageTitle = $story['title'];
$pageDescription = $story['excerpt'];
require __DIR__ . '/includes/header.php';
?>
<article class="container-narrow" style="padding:64px 24px;">
  <?php if ($story['category_name']): ?><p class="kicker"><?= e($story['category_name']) ?></p><?php endif; ?>
  <h1 class="display" style="font-size:36px;"><?= e($story['title']) ?></h1>
  <?php if ($story['first_name']): ?><p class="text-muted">By <?= e($story['first_name'] . ' ' . $story['last_name']) ?></p><?php endif; ?>
  <div style="white-space:pre-wrap; margin-top:24px; color:var(--muted-foreground);"><?= e($story['body']) ?></div>

  <?php if (!empty($tags)): ?>
    <div style="margin-top:24px; display:flex; gap:8px; flex-wrap:wrap;">
      <?php foreach ($tags as $tag): ?><span class="badge badge-neutral"><?= e($tag) ?></span><?php endforeach; ?>
    </div>
  <?php endif; ?>

  <?php if ($reportMessage): ?><div class="alert alert-success" style="margin-top:24px;"><?= e($reportMessage) ?></div><?php endif; ?>
  <?php if ($viewer): ?>
    <details style="margin-top:24px;">
      <summary class="text-muted" style="cursor:pointer; font-size:13px;">Report this story</summary>
      <form method="post" style="margin-top:8px;">
        <?= csrf_field() ?>
        <select name="reason">
          <option value="incorrect_information">Incorrect information</option>
          <option value="inappropriate_content">Inappropriate content</option>
          <option value="other">Other</option>
        </select>
        <textarea name="details" rows="2" placeholder="Additional details (optional)"></textarea>
        <button type="submit" class="btn btn-danger btn-sm" style="margin-top:8px;">Submit report</button>
      </form>
    </details>
  <?php endif; ?>
</article>
<?php require __DIR__ . '/includes/footer.php'; ?>
