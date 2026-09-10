<?php
$activeNav = 'support';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/member_header.php';

$profile = current_profile();
$categories = ['career_guidance', 'professional_advice', 'mentorship', 'relocation_guidance', 'business_introduction', 'education_guidance', 'general_assistance'];
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    if ($title === '' || $description === '') {
        $errors[] = 'Title and description are required.';
    } else {
        db()->prepare('INSERT INTO support_requests (requester_id, category, title, description, urgency, visibility, contact_preference, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, "pending_review", NOW(), NOW())')
            ->execute([
                $profile['id'], $_POST['category'], $title, $description,
                $_POST['urgency'] ?? 'medium', $_POST['visibility'] ?? 'community', $_POST['contact_preference'] ?? 'platform_message',
            ]);
        flash('success', 'Request submitted.');
        redirect('/dashboard/support.php');
    }
}
?>
<h1 class="display">Request Community Support</h1>
<p class="text-muted">Requests are reviewed before becoming visible to other members.</p>
<?php foreach ($errors as $err): ?><div class="alert alert-error"><?= e($err) ?></div><?php endforeach; ?>

<form method="post" class="card" style="max-width:560px;">
  <?= csrf_field() ?>
  <div class="field">
    <label>Category</label>
    <select name="category">
      <?php foreach ($categories as $c): ?><option value="<?= $c ?>"><?= e(str_replace('_', ' ', ucfirst($c))) ?></option><?php endforeach; ?>
    </select>
  </div>
  <div class="field"><label>Title</label><input type="text" name="title" required></div>
  <div class="field"><label>Description</label><textarea name="description" rows="4" required></textarea></div>
  <div class="field-row">
    <div class="field">
      <label>Urgency</label>
      <select name="urgency"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select>
    </div>
    <div class="field">
      <label>Visibility</label>
      <select name="visibility">
        <option value="community" selected>Community</option>
        <option value="public">Public</option>
        <option value="private">Private (admin only)</option>
      </select>
    </div>
  </div>
  <div class="field">
    <label>Preferred contact method</label>
    <select name="contact_preference">
      <option value="platform_message">Platform message</option>
      <option value="email">Email</option>
      <option value="either">Either</option>
    </select>
  </div>
  <button type="submit" class="btn btn-primary">Submit request</button>
</form>
<?php require __DIR__ . '/../includes/member_footer.php'; ?>
