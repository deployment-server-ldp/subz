<?php
$activeNav = 'events';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/member_header.php';

$profile = current_profile();
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $name = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $startsAt = $_POST['starts_at'] ?? '';

    if ($name === '' || $description === '' || $startsAt === '') {
        $errors[] = 'Name, description, and start date/time are required.';
    }

    if (empty($errors)) {
        $baseSlug = slugify($name);
        $exists = db()->prepare('SELECT id FROM events WHERE slug=?');
        $exists->execute([$baseSlug]);
        $slug = $exists->fetch() ? unique_slug($name) : $baseSlug;

        db()->prepare('INSERT INTO events (name, slug, description, starts_at, ends_at, location, country_id, city_id, organizer_id, max_capacity, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "pending_approval", NOW(), NOW())')
            ->execute([
                $name, $slug, $description, $startsAt, $_POST['ends_at'] ?: null, trim($_POST['location'] ?? '') ?: null,
                $_POST['country_id'] ?: null, $_POST['city_id'] ?: null, $profile['id'], $_POST['max_capacity'] ?: null,
            ]);

        flash('success', 'Event submitted for approval.');
        redirect('/dashboard/events.php');
    }
}

$countries = db()->query('SELECT * FROM countries ORDER BY display_order ASC')->fetchAll();
$cities = db()->query('SELECT * FROM cities ORDER BY name ASC')->fetchAll();
?>
<h1 class="display">Propose an Event</h1>
<p class="text-muted">Events are reviewed by our community team before they're published.</p>
<?php foreach ($errors as $err): ?><div class="alert alert-error"><?= e($err) ?></div><?php endforeach; ?>

<form method="post" class="card" style="max-width:560px;">
  <?= csrf_field() ?>
  <div class="field"><label>Event name</label><input type="text" name="name" required></div>
  <div class="field"><label>Description</label><textarea name="description" rows="4" required></textarea></div>
  <div class="field-row">
    <div class="field"><label>Starts at</label><input type="datetime-local" name="starts_at" required></div>
    <div class="field"><label>Ends at (optional)</label><input type="datetime-local" name="ends_at"></div>
  </div>
  <div class="field"><label>Location</label><input type="text" name="location"></div>
  <div class="field-row">
    <div class="field">
      <label>Country</label>
      <select name="country_id" data-country-select>
        <option value="">Select country</option>
        <?php foreach ($countries as $c): ?><option value="<?= $c['id'] ?>"><?= e($c['name']) ?></option><?php endforeach; ?>
      </select>
    </div>
    <div class="field">
      <label>City</label>
      <select name="city_id" data-city-select>
        <option value="">Select city</option>
        <?php foreach ($cities as $c): ?><option value="<?= $c['id'] ?>" data-country="<?= $c['country_id'] ?>"><?= e($c['name']) ?></option><?php endforeach; ?>
      </select>
    </div>
  </div>
  <div class="field"><label>Max capacity (optional)</label><input type="number" name="max_capacity"></div>
  <button type="submit" class="btn btn-primary">Submit for approval</button>
</form>
<?php require __DIR__ . '/../includes/member_footer.php'; ?>
