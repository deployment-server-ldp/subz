<?php
$activeNav = 'countries';
$requiredRoles = ['admin'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

$id = (int) ($_GET['id'] ?? 0);
$stmt = db()->prepare('SELECT * FROM countries WHERE id = ?');
$stmt->execute([$id]);
$country = $stmt->fetch();
if (!$country) {
    http_response_code(404);
    die('Country not found.');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    if (isset($_POST['delete'])) {
        $stmt = db()->prepare('SELECT COUNT(*) FROM profiles WHERE country_id=?');
        $stmt->execute([$id]);
        $memberCount = (int) $stmt->fetchColumn();
        $stmt = db()->prepare('SELECT COUNT(*) FROM cities WHERE country_id=?');
        $stmt->execute([$id]);
        $cityCount = (int) $stmt->fetchColumn();

        if ($memberCount > 0 || $cityCount > 0) {
            flash('error', 'Cannot delete a country that has members or cities.');
            redirect('/admin/country-edit.php?id=' . $id);
        }
        db()->prepare('DELETE FROM countries WHERE id=?')->execute([$id]);
        write_audit_log($__user['id'], 'country.delete', 'Country', (string) $id);
        flash('success', 'Country deleted.');
        redirect('/admin/countries.php');
    }

    db()->prepare('UPDATE countries SET name=?, iso_code=?, summary=?, display_order=? WHERE id=?')->execute([
        trim($_POST['name']), trim($_POST['iso_code'] ?? '') ?: null, trim($_POST['summary'] ?? '') ?: null,
        (int) ($_POST['display_order'] ?? 0), $id,
    ]);
    write_audit_log($__user['id'], 'country.update', 'Country', (string) $id);
    flash('success', 'Saved.');
    redirect('/admin/country-edit.php?id=' . $id);
}
?>
<h1 class="display">Edit <?= e($country['name']) ?></h1>
<form method="post" class="card" style="max-width:480px;">
  <?= csrf_field() ?>
  <div class="field"><label>Name</label><input type="text" name="name" value="<?= e($country['name']) ?>" required></div>
  <div class="field"><label>ISO code</label><input type="text" name="iso_code" value="<?= e($country['iso_code'] ?? '') ?>" maxlength="3"></div>
  <div class="field"><label>Summary</label><textarea name="summary" rows="3"><?= e($country['summary'] ?? '') ?></textarea></div>
  <div class="field"><label>Display order</label><input type="number" name="display_order" value="<?= (int) $country['display_order'] ?>"></div>
  <button type="submit" class="btn btn-primary">Save changes</button>
</form>
<form method="post" data-confirm="Delete this country? It must have no members or cities." style="margin-top:16px;">
  <?= csrf_field() ?>
  <input type="hidden" name="delete" value="1">
  <button type="submit" class="btn btn-danger btn-sm">Delete</button>
</form>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
