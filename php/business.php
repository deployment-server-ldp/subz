<?php
require_once __DIR__ . '/includes/functions.php';

$stmt = db()->prepare(
    "SELECT b.*, bc.name AS category_name, co.name AS country_name, ci.name AS city_name, p.slug AS owner_slug, p.first_name, p.last_name
     FROM businesses b INNER JOIN business_categories bc ON bc.id=b.category_id INNER JOIN countries co ON co.id=b.country_id
     LEFT JOIN cities ci ON ci.id=b.city_id INNER JOIN profiles p ON p.id=b.owner_id
     WHERE b.slug = ? LIMIT 1"
);
$stmt->execute([$_GET['slug'] ?? '']);
$business = $stmt->fetch();

if (!$business || $business['status'] !== 'approved') {
    http_response_code(404);
    require __DIR__ . '/includes/header.php';
    echo '<div class="container" style="padding:64px 24px;"><div class="empty-state">Business not found.</div></div>';
    require __DIR__ . '/includes/footer.php';
    exit;
}

$viewer = current_user();
$reportMessage = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $viewer) {
    require_csrf();
    db()->prepare('INSERT INTO reports (reporter_id, target_type, target_id, reason, details, created_at, updated_at) VALUES (?, "business", ?, ?, ?, NOW(), NOW())')
        ->execute([$viewer['id'], $business['id'], $_POST['reason'] ?? 'other', trim($_POST['details'] ?? '') ?: null]);
    $reportMessage = 'Thanks — our team will review this.';
}

$pageTitle = $business['name'];
require __DIR__ . '/includes/header.php';
?>
<div class="container-narrow" style="padding:64px 24px;">
  <p class="kicker"><?= e($business['category_name']) ?></p>
  <h1 class="display"><?= e($business['name']) ?></h1>
  <p class="text-muted"><?= e(trim(($business['city_name'] ?? '') . ', ' . $business['country_name'], ', ')) ?></p>

  <div class="card"><h3>About</h3><p class="text-muted"><?= e($business['description']) ?></p></div>

  <div class="card">
    <h3>Contact</h3>
    <?php if ($business['website']): ?><p><strong>Website:</strong> <a href="<?= e($business['website']) ?>" target="_blank" rel="noopener"><?= e($business['website']) ?></a></p><?php endif; ?>
    <?php if ($business['contact_method']): ?><p><strong>Contact:</strong> <?= e($business['contact_method']) ?></p><?php endif; ?>
    <p><strong>Owner:</strong> <a href="<?= BASE_URL ?>/member.php?slug=<?= e($business['owner_slug']) ?>"><?= e($business['first_name'] . ' ' . $business['last_name']) ?></a></p>
  </div>

  <?php if ($reportMessage): ?><div class="alert alert-success"><?= e($reportMessage) ?></div><?php endif; ?>
  <?php if ($viewer): ?>
    <details>
      <summary class="text-muted" style="cursor:pointer; font-size:13px;">Report this business</summary>
      <form method="post" style="margin-top:8px;">
        <?= csrf_field() ?>
        <select name="reason">
          <option value="incorrect_information">Incorrect information</option>
          <option value="spam">Spam</option>
          <option value="inappropriate_content">Inappropriate content</option>
          <option value="other">Other</option>
        </select>
        <textarea name="details" rows="2" placeholder="Additional details (optional)"></textarea>
        <button type="submit" class="btn btn-danger btn-sm" style="margin-top:8px;">Submit report</button>
      </form>
    </details>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
