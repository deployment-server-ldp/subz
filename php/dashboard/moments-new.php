<?php
$activeNav = 'dashboard';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/member_header.php';

$profile = current_profile();
$errors = [];
$types = ['celebration', 'wedding', 'graduation', 'birthday', 'business_achievement', 'community_gathering', 'family_gathering', 'other'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $caption = trim($_POST['caption'] ?? '');
    $type = in_array($_POST['type'] ?? '', $types, true) ? $_POST['type'] : 'celebration';

    try {
        $imagePath = upload_image('photo', 'moments');
        if ($caption === '') {
            $errors[] = 'Add a caption.';
        } elseif (!$imagePath) {
            $errors[] = 'Upload a photo first.';
        } else {
            db()->prepare('INSERT INTO moments (caption, type, submitted_by_id, image_path, status, created_at, updated_at) VALUES (?, ?, ?, ?, "pending", NOW(), NOW())')
                ->execute([$caption, $type, $profile['id'], $imagePath]);
            flash('success', 'Moment submitted for review.');
            redirect('/dashboard/index.php');
        }
    } catch (RuntimeException $e) {
        $errors[] = $e->getMessage();
    }
}
?>
<h1 class="display">Share a Moment</h1>
<p class="text-muted">Moments are reviewed by our team before appearing in the community gallery.</p>
<?php foreach ($errors as $err): ?><div class="alert alert-error"><?= e($err) ?></div><?php endforeach; ?>

<form method="post" enctype="multipart/form-data" class="card" style="max-width:480px;">
  <?= csrf_field() ?>
  <div class="field"><label>Photo</label><input type="file" name="photo" accept="image/*" required></div>
  <div class="field">
    <label>Type</label>
    <select name="type">
      <?php foreach ($types as $t): ?><option value="<?= $t ?>"><?= e(str_replace('_', ' ', ucfirst($t))) ?></option><?php endforeach; ?>
    </select>
  </div>
  <div class="field"><label>Caption</label><input type="text" name="caption" required></div>
  <button type="submit" class="btn btn-primary">Submit for review</button>
</form>
<?php require __DIR__ . '/../includes/member_footer.php'; ?>
