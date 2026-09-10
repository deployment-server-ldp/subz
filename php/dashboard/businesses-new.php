<?php
$activeNav = 'businesses';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/member_header.php';

$profile = current_profile();
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $name = trim($_POST['name'] ?? '');
    $categoryId = (int) ($_POST['category_id'] ?? 0);
    $countryId = (int) ($_POST['country_id'] ?? 0);
    $description = trim($_POST['description'] ?? '');

    if ($name === '' || $categoryId <= 0 || $countryId <= 0 || $description === '') {
        $errors[] = 'Please fill in all required fields.';
    }

    if (empty($errors)) {
        $baseSlug = slugify($name);
        $exists = db()->prepare('SELECT id FROM businesses WHERE slug=?');
        $exists->execute([$baseSlug]);
        $slug = $exists->fetch() ? unique_slug($name) : $baseSlug;

        db()->prepare('INSERT INTO businesses (name, slug, owner_id, category_id, country_id, website, description, contact_method, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "pending", NOW(), NOW())')
            ->execute([$name, $slug, $profile['id'], $categoryId, $countryId, trim($_POST['website'] ?? '') ?: null, $description, trim($_POST['contact_method'] ?? '') ?: null]);

        flash('success', 'Business submitted for review.');
        redirect('/dashboard/businesses.php');
    }
}

$categories = db()->query('SELECT * FROM business_categories ORDER BY display_order ASC')->fetchAll();
$countries = db()->query('SELECT * FROM countries ORDER BY display_order ASC')->fetchAll();
?>
<h1 class="display">Add Business</h1>
<p class="text-muted">Your listing will be reviewed by our team before it appears publicly.</p>

<?php foreach ($errors as $err): ?><div class="alert alert-error"><?= e($err) ?></div><?php endforeach; ?>

<form method="post" class="card" style="max-width:520px;">
  <?= csrf_field() ?>
  <div class="field"><label>Business name</label><input type="text" name="name" required></div>
  <div class="field-row">
    <div class="field">
      <label>Category</label>
      <select name="category_id" required>
        <option value="">Select category</option>
        <?php foreach ($categories as $c): ?><option value="<?= $c['id'] ?>"><?= e($c['name']) ?></option><?php endforeach; ?>
      </select>
    </div>
    <div class="field">
      <label>Country</label>
      <select name="country_id" required>
        <option value="">Select country</option>
        <?php foreach ($countries as $c): ?><option value="<?= $c['id'] ?>"><?= e($c['name']) ?></option><?php endforeach; ?>
      </select>
    </div>
  </div>
  <div class="field"><label>Website (optional)</label><input type="text" name="website"></div>
  <div class="field"><label>Description</label><textarea name="description" rows="4" required></textarea></div>
  <div class="field"><label>Contact method (optional)</label><input type="text" name="contact_method" placeholder="Email or phone"></div>
  <button type="submit" class="btn btn-primary">Submit for review</button>
</form>
<?php require __DIR__ . '/../includes/member_footer.php'; ?>
