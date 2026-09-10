<?php
$activeNav = 'countries';
$requiredRoles = ['admin'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $name = trim($_POST['name'] ?? '');
    if ($name !== '') {
        $slug = slugify($name);
        $exists = db()->prepare('SELECT id FROM countries WHERE slug=?');
        $exists->execute([$slug]);
        if ($exists->fetch()) {
            flash('error', 'A country with that name already exists.');
        } else {
            db()->prepare('INSERT INTO countries (name, slug, iso_code, summary, display_order, created_at) VALUES (?, ?, ?, ?, ?, NOW())')
                ->execute([$name, $slug, trim($_POST['iso_code'] ?? '') ?: null, trim($_POST['summary'] ?? '') ?: null, (int) ($_POST['display_order'] ?? 0)]);
            write_audit_log($__user['id'], 'country.create', 'Country', $slug);
            flash('success', 'Country added.');
        }
    }
    redirect('/admin/countries.php');
}

$countries = db()->query(
    "SELECT c.*, (SELECT COUNT(*) FROM profiles WHERE country_id=c.id) AS member_count, (SELECT COUNT(*) FROM cities WHERE country_id=c.id) AS city_count
     FROM countries c ORDER BY display_order ASC"
)->fetchAll();
?>
<h1 class="display">Countries</h1>

<form method="post" class="card field-row" style="align-items:flex-end;">
  <?= csrf_field() ?>
  <div class="field"><label>Name</label><input type="text" name="name" required></div>
  <div class="field"><label>ISO code</label><input type="text" name="iso_code" maxlength="3"></div>
  <div class="field"><label>Display order</label><input type="number" name="display_order" value="0" style="width:80px;"></div>
  <div class="field"><button type="submit" class="btn btn-primary btn-sm">Add Country</button></div>
</form>

<table>
  <tr><th>Name</th><th>Members</th><th>Cities</th><th></th></tr>
  <?php foreach ($countries as $c): ?>
    <tr>
      <td><?= e($c['name']) ?></td>
      <td><?= (int) $c['member_count'] ?></td>
      <td><?= (int) $c['city_count'] ?></td>
      <td><a href="<?= BASE_URL ?>/admin/country-edit.php?id=<?= $c['id'] ?>">Edit</a></td>
    </tr>
  <?php endforeach; ?>
</table>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
