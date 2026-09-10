<?php
$activeNav = 'cities';
$requiredRoles = ['admin'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    if (isset($_POST['delete_id'])) {
        $cityId = (int) $_POST['delete_id'];
        $stmt = db()->prepare('SELECT COUNT(*) FROM profiles WHERE city_id=?');
        $stmt->execute([$cityId]);
        if ((int) $stmt->fetchColumn() > 0) {
            flash('error', 'Cannot delete a city that has members.');
        } else {
            db()->prepare('DELETE FROM cities WHERE id=?')->execute([$cityId]);
            write_audit_log($__user['id'], 'city.delete', 'City', (string) $cityId);
            flash('success', 'City deleted.');
        }
    } else {
        $name = trim($_POST['name'] ?? '');
        $countryId = (int) ($_POST['country_id'] ?? 0);
        if ($name !== '' && $countryId > 0) {
            $slug = slugify($name);
            $exists = db()->prepare('SELECT id FROM cities WHERE country_id=? AND slug=?');
            $exists->execute([$countryId, $slug]);
            if ($exists->fetch()) {
                flash('error', 'That city already exists for this country.');
            } else {
                db()->prepare('INSERT INTO cities (name, slug, country_id, created_at) VALUES (?, ?, ?, NOW())')->execute([$name, $slug, $countryId]);
                write_audit_log($__user['id'], 'city.create', 'City', $slug);
                flash('success', 'City added.');
            }
        }
    }
    redirect('/admin/cities.php');
}

$countries = db()->query('SELECT * FROM countries ORDER BY display_order ASC')->fetchAll();
$cities = db()->query(
    "SELECT ci.*, co.name AS country_name, (SELECT COUNT(*) FROM profiles WHERE city_id=ci.id) AS member_count
     FROM cities ci INNER JOIN countries co ON co.id = ci.country_id ORDER BY ci.name ASC"
)->fetchAll();
?>
<h1 class="display">Cities</h1>
<form method="post" class="card field-row" style="align-items:flex-end;">
  <?= csrf_field() ?>
  <div class="field"><label>City name</label><input type="text" name="name" required></div>
  <div class="field">
    <label>Country</label>
    <select name="country_id" required>
      <option value="">Select country</option>
      <?php foreach ($countries as $c): ?><option value="<?= $c['id'] ?>"><?= e($c['name']) ?></option><?php endforeach; ?>
    </select>
  </div>
  <div class="field"><button type="submit" class="btn btn-primary btn-sm">Add City</button></div>
</form>

<table>
  <tr><th>City</th><th>Country</th><th>Members</th><th></th></tr>
  <?php foreach ($cities as $city): ?>
    <tr>
      <td><?= e($city['name']) ?></td>
      <td><?= e($city['country_name']) ?></td>
      <td><?= (int) $city['member_count'] ?></td>
      <td>
        <form method="post" data-confirm="Delete this city?" style="display:inline;">
          <?= csrf_field() ?>
          <input type="hidden" name="delete_id" value="<?= $city['id'] ?>">
          <button type="submit" class="btn btn-danger btn-sm">Delete</button>
        </form>
      </td>
    </tr>
  <?php endforeach; ?>
</table>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
