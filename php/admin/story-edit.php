<?php
$activeNav = 'stories';
$requiredRoles = ['admin', 'content_manager'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$story = null;
if ($id) {
    $stmt = db()->prepare('SELECT * FROM stories WHERE id = ?');
    $stmt->execute([$id]);
    $story = $stmt->fetch();
    if (!$story) {
        http_response_code(404);
        die('Story not found.');
    }
}

$types = ['member', 'family', 'heritage', 'history', 'achievement', 'professional_journey', 'community', 'global'];
$statuses = ['draft', 'pending_review', 'published', 'scheduled', 'rejected', 'archived'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    if (isset($_POST['delete']) && $id) {
        db()->prepare('UPDATE stories SET deleted_at=NOW(), status="archived" WHERE id=?')->execute([$id]);
        write_audit_log($__user['id'], 'story.delete', 'Story', (string) $id);
        flash('success', 'Story archived.');
        redirect('/admin/stories.php');
    }

    $title = trim($_POST['title'] ?? '');
    $status = in_array($_POST['status'] ?? '', $statuses, true) ? $_POST['status'] : 'draft';
    $publishedAt = $status === 'published' ? ($story['published_at'] ?? date('Y-m-d H:i:s')) : ($story['published_at'] ?? null);
    $scheduledAt = $status === 'scheduled' && !empty($_POST['scheduled_at']) ? $_POST['scheduled_at'] : null;

    if ($id) {
        db()->prepare('UPDATE stories SET title=?, excerpt=?, body=?, type=?, category_id=?, status=?, featured=?, published_at=?, scheduled_at=?, updated_at=NOW() WHERE id=?')
            ->execute([
                $title, trim($_POST['excerpt'] ?? '') ?: null, trim($_POST['body'] ?? ''), $_POST['type'],
                $_POST['category_id'] ?: null, $status, isset($_POST['featured']) ? 1 : 0, $publishedAt, $scheduledAt, $id,
            ]);
        write_audit_log($__user['id'], 'story.update', 'Story', (string) $id);
    } else {
        $baseSlug = slugify($title);
        $exists = db()->prepare('SELECT id FROM stories WHERE slug=?');
        $exists->execute([$baseSlug]);
        $slug = $exists->fetch() ? unique_slug($title) : $baseSlug;

        db()->prepare('INSERT INTO stories (title, slug, excerpt, body, type, category_id, status, featured, published_at, scheduled_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())')
            ->execute([
                $title, $slug, trim($_POST['excerpt'] ?? '') ?: null, trim($_POST['body'] ?? ''), $_POST['type'],
                $_POST['category_id'] ?: null, $status, isset($_POST['featured']) ? 1 : 0, $publishedAt, $scheduledAt,
            ]);
        $id = (int) db()->lastInsertId();
        write_audit_log($__user['id'], 'story.create', 'Story', (string) $id);
    }

    // Tags: comma-separated, upsert by name.
    db()->prepare('DELETE FROM story_tags WHERE story_id=?')->execute([$id]);
    $tagNames = array_filter(array_map('trim', explode(',', $_POST['tags'] ?? '')));
    foreach ($tagNames as $tagName) {
        $tagSlug = slugify($tagName);
        db()->prepare('INSERT INTO tags (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)')->execute([$tagName, $tagSlug]);
        $tagStmt = db()->prepare('SELECT id FROM tags WHERE slug = ?');
        $tagStmt->execute([$tagSlug]);
        $tagId = (int) $tagStmt->fetchColumn();
        db()->prepare('INSERT IGNORE INTO story_tags (story_id, tag_id) VALUES (?, ?)')->execute([$id, $tagId]);
    }

    flash('success', 'Saved.');
    redirect('/admin/story-edit.php?id=' . $id);
}

$categories = db()->query('SELECT * FROM story_categories ORDER BY name ASC')->fetchAll();
$currentTags = '';
if ($story) {
    $stmt = db()->prepare('SELECT t.name FROM story_tags st INNER JOIN tags t ON t.id = st.tag_id WHERE st.story_id=?');
    $stmt->execute([$story['id']]);
    $currentTags = implode(', ', array_column($stmt->fetchAll(), 'name'));
}
?>
<h1 class="display"><?= $story ? 'Edit Story' : 'New Story' ?></h1>
<form method="post" class="card" style="max-width:700px;">
  <?= csrf_field() ?>
  <div class="field"><label>Title</label><input type="text" name="title" value="<?= e($story['title'] ?? '') ?>" required></div>
  <div class="field"><label>Excerpt</label><input type="text" name="excerpt" value="<?= e($story['excerpt'] ?? '') ?>" maxlength="300"></div>
  <div class="field"><label>Body</label><textarea name="body" rows="10" required><?= e($story['body'] ?? '') ?></textarea></div>
  <div class="field-row">
    <div class="field">
      <label>Type</label>
      <select name="type">
        <?php foreach ($types as $t): ?><option value="<?= $t ?>" <?= ($story['type'] ?? '') === $t ? 'selected' : '' ?>><?= e(str_replace('_', ' ', ucfirst($t))) ?></option><?php endforeach; ?>
      </select>
    </div>
    <div class="field">
      <label>Category</label>
      <select name="category_id">
        <option value="">None</option>
        <?php foreach ($categories as $c): ?><option value="<?= $c['id'] ?>" <?= ($story['category_id'] ?? '') == $c['id'] ? 'selected' : '' ?>><?= e($c['name']) ?></option><?php endforeach; ?>
      </select>
    </div>
  </div>
  <div class="field"><label>Tags (comma-separated)</label><input type="text" name="tags" value="<?= e($currentTags) ?>"></div>
  <div class="field-row">
    <div class="field">
      <label>Status</label>
      <select name="status">
        <?php foreach ($statuses as $s): ?><option value="<?= $s ?>" <?= ($story['status'] ?? 'draft') === $s ? 'selected' : '' ?>><?= e(str_replace('_', ' ', ucfirst($s))) ?></option><?php endforeach; ?>
      </select>
    </div>
    <div class="field"><label>Scheduled at</label><input type="datetime-local" name="scheduled_at" value="<?= e($story['scheduled_at'] ?? '') ?>"></div>
  </div>
  <div class="checkbox-row">
    <input type="checkbox" name="featured" id="featured" <?= !empty($story['featured']) ? 'checked' : '' ?>>
    <label for="featured">Feature on homepage</label>
  </div>
  <button type="submit" class="btn btn-primary"><?= $story ? 'Save changes' : 'Create story' ?></button>
</form>

<?php if ($story): ?>
  <form method="post" data-confirm="Archive this story?" style="margin-top:16px;">
    <?= csrf_field() ?>
    <input type="hidden" name="delete" value="1">
    <button type="submit" class="btn btn-danger btn-sm">Archive</button>
  </form>
<?php endif; ?>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
