<?php
require_once __DIR__ . '/includes/functions.php';

$stmt = db()->prepare('SELECT * FROM family_branches WHERE slug = ? AND deleted_at IS NULL LIMIT 1');
$stmt->execute([$_GET['slug'] ?? '']);
$branch = $stmt->fetch();
if (!$branch) {
    http_response_code(404);
    require __DIR__ . '/includes/header.php';
    echo '<div class="container" style="padding:64px 24px;"><div class="empty-state">Family branch not found.</div></div>';
    require __DIR__ . '/includes/footer.php';
    exit;
}

$viewer = current_user();
$viewerProfile = current_profile();
$message = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $viewerProfile) {
    require_csrf();
    $exists = db()->prepare('SELECT id FROM family_branch_memberships WHERE profile_id=? AND branch_id=?');
    $exists->execute([$viewerProfile['id'], $branch['id']]);
    if ($exists->fetch()) {
        $message = "You've already requested this branch.";
    } else {
        db()->prepare('INSERT INTO family_branch_memberships (profile_id, branch_id, status, created_at) VALUES (?, ?, "pending", NOW())')
            ->execute([$viewerProfile['id'], $branch['id']]);
        $message = 'Request sent to community admins.';
    }
}

$members = db()->prepare(
    "SELECT p.slug, p.first_name, p.last_name FROM family_branch_memberships m
     INNER JOIN profiles p ON p.id = m.profile_id
     WHERE m.branch_id = ? AND m.status = 'approved' AND p.verification_status = 'verified' AND p.visibility IN ('public','community')"
);
$members->execute([$branch['id']]);
$members = $members->fetchAll();

$pageTitle = $branch['name'];
require __DIR__ . '/includes/header.php';
?>
<div class="container-narrow" style="padding:64px 24px;">
  <h1 class="display"><?= e($branch['name']) ?></h1>
  <?php if ($branch['region']): ?><p class="text-muted"><?= e($branch['region']) ?></p><?php endif; ?>
  <?php if ($branch['description']): ?><p class="text-muted"><?= e($branch['description']) ?></p><?php endif; ?>

  <?php if ($branch['historical_information']): ?>
    <div class="card"><h3>History</h3><p class="text-muted"><?= e($branch['historical_information']) ?></p></div>
  <?php endif; ?>

  <div class="card">
    <h3>Associated Members (<?= count($members) ?>)</h3>
    <?php if (empty($members)): ?>
      <p class="text-muted">No members have publicly associated with this branch yet.</p>
    <?php else: ?>
      <?php foreach ($members as $m): ?>
        <p><a href="<?= BASE_URL ?>/member.php?slug=<?= e($m['slug']) ?>"><?= e($m['first_name'] . ' ' . $m['last_name']) ?></a></p>
      <?php endforeach; ?>
    <?php endif; ?>
  </div>

  <?php if ($message): ?><div class="alert alert-success"><?= e($message) ?></div><?php endif; ?>
  <?php if ($viewer): ?>
    <form method="post">
      <?= csrf_field() ?>
      <button type="submit" class="btn btn-secondary btn-sm">Request to Join This Branch</button>
    </form>
  <?php else: ?>
    <p class="text-muted"><a href="<?= BASE_URL ?>/login.php">Sign in</a> to request association with this branch.</p>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
