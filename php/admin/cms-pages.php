<?php
$activeNav = 'cms-pages';
$requiredRoles = ['admin', 'content_manager'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $title = trim($_POST['title'] ?? '');
    $slug = slugify(trim($_POST['slug'] ?? $title));
    if ($title !== '' && $slug !== '') {
        $exists = db()->prepare('SELECT id FROM pages WHERE slug=?');
        $exists->execute([$slug]);
        if ($exists->fetch()) {
            flash('error', 'A page with that slug already exists.');
        } else {
            db()->prepare('INSERT INTO pages (title, slug, body, status, created_at, updated_at) VALUES (?, ?, ?, "draft", NOW(), NOW())')
                ->execute([$title, $slug, trim($_POST['body'] ?? '')]);
            write_audit_log($__user['id'], 'page.create', 'Page', $slug);
            flash('success', 'Page created.');
        }
    }
    redirect('/admin/cms-pages.php');
}

$pages = db()->query('SELECT * FROM pages ORDER BY title ASC')->fetchAll();
?>
<h1 class="display">CMS Pages</h1>
<p class="text-muted">Manage copy for /about, /history, /privacy, /terms, /community-guidelines, /verification-info, /contact — matched by slug.</p>

<form method="post" class="card" style="max-width:600px;">
  <?= csrf_field() ?>
  <div class="field"><label>Title</label><input type="text" name="title" required></div>
  <div class="field"><label>Slug (e.g. about)</label><input type="text" name="slug"></div>
  <div class="field"><label>Content</label><textarea name="body" rows="6"></textarea></div>
  <button type="submit" class="btn btn-primary btn-sm">Create page</button>
</form>

<table>
  <tr><th>Title</th><th>Slug</th><th>Status</th><th></th></tr>
  <?php foreach ($pages as $p): ?>
    <tr>
      <td><?= e($p['title']) ?></td>
      <td>/<?= e($p['slug']) ?></td>
      <td><span class="badge badge-<?= $p['status'] === 'published' ? 'success' : 'neutral' ?>"><?= e($p['status']) ?></span></td>
      <td><a href="<?= BASE_URL ?>/admin/cms-page-edit.php?id=<?= $p['id'] ?>">Edit</a></td>
    </tr>
  <?php endforeach; ?>
</table>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
