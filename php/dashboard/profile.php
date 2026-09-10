<?php
$activeNav = 'profile';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/member_header.php';

$profile = current_profile();
$tab = in_array($_GET['tab'] ?? 'personal', ['personal', 'professional', 'family', 'privacy'], true) ? $_GET['tab'] : 'personal';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $postedTab = $_POST['tab'] ?? 'personal';

    try {
        if ($postedTab === 'photo') {
            $path = upload_image('photo', 'profiles');
            if ($path) {
                db()->prepare('UPDATE profiles SET photo_path=?, updated_at=NOW() WHERE id=?')->execute([$path, $profile['id']]);
            }
            flash('success', 'Photo updated.');
        } elseif ($postedTab === 'personal') {
            $stmt = db()->prepare('UPDATE profiles SET first_name=?, middle_name=?, last_name=?, gender=?, date_of_birth=?, country_id=?, city_id=?, current_residence=?, nationality=?, bio=?, updated_at=NOW() WHERE id=?');
            $stmt->execute([
                trim($_POST['first_name']), trim($_POST['middle_name']) ?: null, trim($_POST['last_name']),
                $_POST['gender'] ?: null, $_POST['date_of_birth'] ?: null,
                $_POST['country_id'] ?: null, $_POST['city_id'] ?: null,
                trim($_POST['current_residence']) ?: null, trim($_POST['nationality']) ?: null, trim($_POST['bio']) ?: null,
                $profile['id'],
            ]);
            flash('success', 'Saved.');
        } elseif ($postedTab === 'professional') {
            $stmt = db()->prepare('UPDATE profiles SET profession=?, job_title=?, company=?, industry=?, skills=?, education=?, university=?, linkedin_url=?, website_url=?, updated_at=NOW() WHERE id=?');
            $stmt->execute([
                trim($_POST['profession']) ?: null, trim($_POST['job_title']) ?: null, trim($_POST['company']) ?: null,
                trim($_POST['industry']) ?: null, trim($_POST['skills']) ?: null, trim($_POST['education']) ?: null,
                trim($_POST['university']) ?: null, trim($_POST['linkedin_url']) ?: null, trim($_POST['website_url']) ?: null,
                $profile['id'],
            ]);
            db()->prepare('DELETE FROM profile_professional_categories WHERE profile_id=?')->execute([$profile['id']]);
            foreach ($_POST['categories'] ?? [] as $categoryId) {
                db()->prepare('INSERT IGNORE INTO profile_professional_categories (profile_id, category_id) VALUES (?, ?)')->execute([$profile['id'], (int) $categoryId]);
            }
            flash('success', 'Saved.');
        } elseif ($postedTab === 'family') {
            $stmt = db()->prepare('UPDATE profiles SET fathers_name=?, grandfathers_name=?, great_grandfathers_name=?, ancestral_region=?, family_information=?, updated_at=NOW() WHERE id=?');
            $stmt->execute([
                trim($_POST['fathers_name']) ?: null, trim($_POST['grandfathers_name']) ?: null,
                trim($_POST['great_grandfathers_name']) ?: null, trim($_POST['ancestral_region']) ?: null,
                trim($_POST['family_information']) ?: null, $profile['id'],
            ]);
            flash('success', 'Saved.');
        } elseif ($postedTab === 'privacy') {
            $visibility = in_array($_POST['visibility'] ?? '', ['public', 'community', 'private'], true) ? $_POST['visibility'] : 'community';
            $isIndexable = ($visibility === 'public' && $profile['verification_status'] === 'verified') ? 1 : 0;
            $stmt = db()->prepare('UPDATE profiles SET visibility=?, open_to_networking=?, open_to_mentorship=?, open_to_business_network=?, open_to_events=?, open_to_helping=?, is_indexable=?, updated_at=NOW() WHERE id=?');
            $stmt->execute([
                $visibility,
                isset($_POST['open_to_networking']) ? 1 : 0,
                isset($_POST['open_to_mentorship']) ? 1 : 0,
                isset($_POST['open_to_business_network']) ? 1 : 0,
                isset($_POST['open_to_events']) ? 1 : 0,
                isset($_POST['open_to_helping']) ? 1 : 0,
                $isIndexable,
                $profile['id'],
            ]);
            flash('success', 'Saved.');
        }
    } catch (RuntimeException $e) {
        flash('error', $e->getMessage());
    }

    redirect('/dashboard/profile.php?tab=' . $tab);
}

$profile = current_profile(); // re-fetch after any save
$countries = db()->query('SELECT * FROM countries ORDER BY display_order ASC')->fetchAll();
$cities = db()->query('SELECT * FROM cities ORDER BY name ASC')->fetchAll();
$categories = db()->query('SELECT * FROM professional_categories ORDER BY display_order ASC')->fetchAll();
$stmt = db()->prepare('SELECT category_id FROM profile_professional_categories WHERE profile_id=?');
$stmt->execute([$profile['id']]);
$myCategoryIds = array_column($stmt->fetchAll(), 'category_id');
?>
<h1 class="display">Your profile</h1>
<div class="tabs">
  <a href="?tab=personal" class="<?= $tab === 'personal' ? 'active' : '' ?>">Personal</a>
  <a href="?tab=professional" class="<?= $tab === 'professional' ? 'active' : '' ?>">Professional</a>
  <a href="?tab=family" class="<?= $tab === 'family' ? 'active' : '' ?>">Family</a>
  <a href="?tab=privacy" class="<?= $tab === 'privacy' ? 'active' : '' ?>">Privacy</a>
</div>

<?php if ($tab === 'personal'): ?>
  <div class="card" style="max-width:400px;">
    <?php if ($profile['photo_path']): ?>
      <img src="<?= e(upload_url($profile['photo_path'])) ?>" alt="" style="width:80px; height:80px; border-radius:50%; object-fit:cover;">
    <?php endif; ?>
    <form method="post" enctype="multipart/form-data" style="margin-top:12px;">
      <?= csrf_field() ?>
      <input type="hidden" name="tab" value="photo">
      <input type="file" name="photo" accept="image/*">
      <button type="submit" class="btn btn-secondary btn-sm" style="margin-top:8px;">Upload photo</button>
    </form>
  </div>

  <form method="post" class="card" style="max-width:640px;">
    <?= csrf_field() ?>
    <input type="hidden" name="tab" value="personal">
    <div class="field-row">
      <div class="field"><label>First name</label><input type="text" name="first_name" value="<?= e($profile['first_name']) ?>" required></div>
      <div class="field"><label>Middle name</label><input type="text" name="middle_name" value="<?= e($profile['middle_name'] ?? '') ?>"></div>
      <div class="field"><label>Last name</label><input type="text" name="last_name" value="<?= e($profile['last_name']) ?>" required></div>
    </div>
    <div class="field-row">
      <div class="field">
        <label>Gender (optional)</label>
        <select name="gender">
          <option value="">Prefer not to say</option>
          <?php foreach (['male' => 'Male', 'female' => 'Female', 'other' => 'Other'] as $val => $label): ?>
            <option value="<?= $val ?>" <?= $profile['gender'] === $val ? 'selected' : '' ?>><?= $label ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="field"><label>Date of birth (optional)</label><input type="date" name="date_of_birth" value="<?= e($profile['date_of_birth'] ?? '') ?>"></div>
    </div>
    <div class="field-row">
      <div class="field">
        <label>Country</label>
        <select name="country_id" data-country-select>
          <option value="">Select country</option>
          <?php foreach ($countries as $c): ?>
            <option value="<?= $c['id'] ?>" <?= $profile['country_id'] == $c['id'] ? 'selected' : '' ?>><?= e($c['name']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="field">
        <label>City</label>
        <select name="city_id" data-city-select data-selected="<?= e($profile['city_id'] ?? '') ?>">
          <option value="">Select city</option>
          <?php foreach ($cities as $city): ?>
            <option value="<?= $city['id'] ?>" data-country="<?= $city['country_id'] ?>"><?= e($city['name']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
    </div>
    <div class="field-row">
      <div class="field"><label>Current residence (optional)</label><input type="text" name="current_residence" value="<?= e($profile['current_residence'] ?? '') ?>"></div>
      <div class="field"><label>Nationality (optional)</label><input type="text" name="nationality" value="<?= e($profile['nationality'] ?? '') ?>"></div>
    </div>
    <div class="field"><label>Bio</label><textarea name="bio" rows="4"><?= e($profile['bio'] ?? '') ?></textarea></div>
    <button type="submit" class="btn btn-primary">Save changes</button>
  </form>

<?php elseif ($tab === 'professional'): ?>
  <form method="post" class="card" style="max-width:640px;">
    <?= csrf_field() ?>
    <input type="hidden" name="tab" value="professional">
    <div class="field-row">
      <div class="field"><label>Profession</label><input type="text" name="profession" value="<?= e($profile['profession'] ?? '') ?>"></div>
      <div class="field"><label>Job title</label><input type="text" name="job_title" value="<?= e($profile['job_title'] ?? '') ?>"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Company</label><input type="text" name="company" value="<?= e($profile['company'] ?? '') ?>"></div>
      <div class="field"><label>Industry</label><input type="text" name="industry" value="<?= e($profile['industry'] ?? '') ?>"></div>
    </div>
    <div class="field"><label>Skills (comma-separated)</label><input type="text" name="skills" value="<?= e($profile['skills'] ?? '') ?>"></div>
    <div class="field">
      <label>Professional categories</label>
      <?php foreach ($categories as $category): ?>
        <span class="checkbox-row" style="display:inline-flex; margin-right:16px;">
          <input type="checkbox" name="categories[]" value="<?= $category['id'] ?>" id="cat<?= $category['id'] ?>" <?= in_array($category['id'], $myCategoryIds) ? 'checked' : '' ?>>
          <label for="cat<?= $category['id'] ?>" style="margin:0;"><?= e($category['name']) ?></label>
        </span>
      <?php endforeach; ?>
    </div>
    <div class="field-row">
      <div class="field"><label>Education</label><input type="text" name="education" value="<?= e($profile['education'] ?? '') ?>"></div>
      <div class="field"><label>University</label><input type="text" name="university" value="<?= e($profile['university'] ?? '') ?>"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>LinkedIn URL</label><input type="text" name="linkedin_url" value="<?= e($profile['linkedin_url'] ?? '') ?>"></div>
      <div class="field"><label>Personal website</label><input type="text" name="website_url" value="<?= e($profile['website_url'] ?? '') ?>"></div>
    </div>
    <button type="submit" class="btn btn-primary">Save changes</button>
  </form>

<?php elseif ($tab === 'family'): ?>
  <form method="post" class="card" style="max-width:640px;">
    <?= csrf_field() ?>
    <input type="hidden" name="tab" value="family">
    <p class="text-muted">This information is never shown publicly by default (see Privacy tab).</p>
    <div class="field-row">
      <div class="field"><label>Father's name</label><input type="text" name="fathers_name" value="<?= e($profile['fathers_name'] ?? '') ?>"></div>
      <div class="field"><label>Grandfather's name</label><input type="text" name="grandfathers_name" value="<?= e($profile['grandfathers_name'] ?? '') ?>"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Great-grandfather's name</label><input type="text" name="great_grandfathers_name" value="<?= e($profile['great_grandfathers_name'] ?? '') ?>"></div>
      <div class="field"><label>Ancestral region</label><input type="text" name="ancestral_region" value="<?= e($profile['ancestral_region'] ?? '') ?>"></div>
    </div>
    <div class="field"><label>Family information</label><textarea name="family_information" rows="4"><?= e($profile['family_information'] ?? '') ?></textarea></div>
    <button type="submit" class="btn btn-primary">Save changes</button>
  </form>
  <p class="text-muted">Want to associate with a family branch? <a href="<?= BASE_URL ?>/family.php">Explore Family Branches</a></p>

<?php elseif ($tab === 'privacy'): ?>
  <form method="post" class="card" style="max-width:480px;">
    <?= csrf_field() ?>
    <input type="hidden" name="tab" value="privacy">
    <div class="field">
      <label>Profile visibility</label>
      <select name="visibility">
        <option value="public" <?= $profile['visibility'] === 'public' ? 'selected' : '' ?>>Public — visible to anyone (once verified)</option>
        <option value="community" <?= $profile['visibility'] === 'community' ? 'selected' : '' ?>>Community only — signed-in members</option>
        <option value="private" <?= $profile['visibility'] === 'private' ? 'selected' : '' ?>>Private — hidden from directory</option>
      </select>
      <p class="text-muted" style="font-size:12px;">Your phone number, address, and private family details are never shown publicly, regardless of this setting.</p>
    </div>
    <?php
    $toggles = [
        'open_to_networking' => 'Open to professional networking',
        'open_to_mentorship' => 'Open to mentorship',
        'open_to_business_network' => 'Open to business networking',
        'open_to_events' => 'Open to community events',
        'open_to_helping' => 'Open to helping other members',
    ];
    foreach ($toggles as $field => $label): ?>
      <div class="checkbox-row">
        <input type="checkbox" name="<?= $field ?>" id="<?= $field ?>" <?= $profile[$field] ? 'checked' : '' ?>>
        <label for="<?= $field ?>"><?= e($label) ?></label>
      </div>
    <?php endforeach; ?>
    <button type="submit" class="btn btn-primary">Save changes</button>
  </form>
<?php endif; ?>

<?php require __DIR__ . '/../includes/member_footer.php'; ?>
