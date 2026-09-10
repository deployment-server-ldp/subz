<?php
$activeNav = 'cms-pages';
$requiredRoles = ['admin', 'content_manager'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

$id = (int) ($_GET['id'] ?? 0);
$stmt = db()->prepare('SELECT * FROM pages WHERE id = ?');
$stmt->execute([$id]);
$page = $stmt->fetch();
if (!$page) {
    http_response_code(404);
    die('Page not found.');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    if (isset($_POST['delete'])) {
        db()->prepare('DELETE FROM pages WHERE id=?')->execute([$id]);
        write_audit_log($__user['id'], 'page.delete', 'Page', (string) $id);
        flash('success', 'Page deleted.');
        redirect('/admin/cms-pages.php');
    }
    $status = $_POST['status'] === 'published' ? 'published' : 'draft';
    db()->prepare('UPDATE pages SET title=?, body=?, status=?, updated_at=NOW() WHERE id=?')
        ->execute([trim($_POST['title']), trim($_POST['body'] ?? ''), $status, $id]);
    write_audit_log($__user['id'], 'page.update', 'Page', (string) $id);
    flash('success', 'Saved.');
    redirect('/admin/cms-page-edit.php?id=' . $id);
}
?>
<h1 class="display">Edit <?= e($page['title']) ?></h1>
<p class="text-muted">Slug: /<?= e($page['slug']) ?> (cannot be changed)</p>
<form method="post" class="card" style="max-width:600px;">
  <?= csrf_field() ?>
  <div class="field"><label>Title</label><input type="text" name="title" value="<?= e($page['title']) ?>" required></div>
  <div class="field"><label>Content</label><textarea name="body" rows="10"><?= e($page['body']) ?></textarea></div>
  <div class="field">
    <label>Status</label>
    <select name="status">
      <option value="draft" <?= $page['status'] === 'draft' ? 'selected' : '' ?>>Draft</option>
      <option value="published" <?= $page['status'] === 'published' ? 'selected' : '' ?>>Published</option>
    </select>
  </div>
  <button type="submit" class="btn btn-primary">Save changes</button>
</form>
<form method="post" data-confirm="Delete this page?" style="margin-top:16px;">
  <?= csrf_field() ?>
  <input type="hidden" name="delete" value="1">
  <button type="submit" class="btn btn-danger btn-sm">Delete</button>
</form>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
