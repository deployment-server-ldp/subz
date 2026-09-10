<?php
$activeNav = 'business-categories';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    if (isset($_POST['delete_id'])) {
        try {
            db()->prepare('DELETE FROM business_categories WHERE id=?')->execute([(int) $_POST['delete_id']]);
            flash('success', 'Category deleted.');
        } catch (PDOException $e) {
            flash('error', 'This category is in use and cannot be deleted.');
        }
    } else {
        $name = trim($_POST['name'] ?? '');
        if ($name !== '') {
            $slug = slugify($name);
            db()->prepare('INSERT IGNORE INTO business_categories (name, slug, description, display_order) VALUES (?, ?, ?, ?)')
                ->execute([$name, $slug, trim($_POST['description'] ?? '') ?: null, (int) ($_POST['display_order'] ?? 0)]);
            flash('success', 'Category added.');
        }
    }
    redirect('/admin/business-categories.php');
}

$categories = db()->query('SELECT * FROM business_categories ORDER BY display_order ASC')->fetchAll();
?>
<h1 class="display">Business Categories</h1>
<form method="post" class="card field-row" style="align-items:flex-end;">
  <?= csrf_field() ?>
  <div class="field"><label>Name</label><input type="text" name="name" required></div>
  <div class="field"><label>Description</label><input type="text" name="description"></div>
  <div class="field"><label>Order</label><input type="number" name="display_order" value="0" style="width:80px;"></div>
  <div class="field"><button type="submit" class="btn btn-primary btn-sm">Add</button></div>
</form>
<table>
  <tr><th>Name</th><th>Description</th><th></th></tr>
  <?php foreach ($categories as $cat): ?>
    <tr>
      <td><?= e($cat['name']) ?></td>
      <td><?= e($cat['description'] ?? '—') ?></td>
      <td>
        <form method="post" data-confirm="Delete this category?" style="display:inline;">
          <?= csrf_field() ?><input type="hidden" name="delete_id" value="<?= $cat['id'] ?>">
          <button type="submit" class="btn btn-danger btn-sm">Delete</button>
        </form>
      </td>
    </tr>
  <?php endforeach; ?>
</table>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
