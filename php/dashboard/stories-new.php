<?php
$activeNav = 'dashboard';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/member_header.php';

$profile = current_profile();
$errors = [];
$types = ['member', 'family', 'heritage', 'history', 'achievement', 'professional_journey', 'community', 'global'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $title = trim($_POST['title'] ?? '');
    $body = trim($_POST['body'] ?? '');
    $type = in_array($_POST['type'] ?? '', $types, true) ? $_POST['type'] : 'member';

    if ($title === '' || $body === '') {
        $errors[] = 'Title and story content are required.';
    }

    if (empty($errors)) {
        $baseSlug = slugify($title);
        $exists = db()->prepare('SELECT id FROM stories WHERE slug=?');
        $exists->execute([$baseSlug]);
        $slug = $exists->fetch() ? unique_slug($title) : $baseSlug;

        db()->prepare('INSERT INTO stories (title, slug, excerpt, body, type, author_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, "pending_review", NOW(), NOW())')
            ->execute([$title, $slug, trim($_POST['excerpt'] ?? '') ?: null, $body, $type, $profile['id']]);

        flash('success', 'Story submitted for review.');
        redirect('/dashboard/index.php');
    }
}
?>
<h1 class="display">Share Your Story</h1>
<p class="text-muted">Stories are reviewed by our editorial team before publishing.</p>
<?php foreach ($errors as $err): ?><div class="alert alert-error"><?= e($err) ?></div><?php endforeach; ?>

<form method="post" class="card" style="max-width:600px;">
  <?= csrf_field() ?>
  <div class="field"><label>Title</label><input type="text" name="title" required></div>
  <div class="field">
    <label>Type</label>
    <select name="type">
      <?php foreach ($types as $t): ?><option value="<?= $t ?>"><?= e(str_replace('_', ' ', ucfirst($t))) ?></option><?php endforeach; ?>
    </select>
  </div>
  <div class="field"><label>Short excerpt (optional)</label><input type="text" name="excerpt" maxlength="300"></div>
  <div class="field"><label>Your story</label><textarea name="body" rows="10" required></textarea></div>
  <button type="submit" class="btn btn-primary">Submit for review</button>
</form>
<?php require __DIR__ . '/../includes/member_footer.php'; ?>
