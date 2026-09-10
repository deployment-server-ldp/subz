<?php
$activeNav = 'family-branches';
$requiredRoles = ['admin', 'regional_coordinator'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

$id = (int) ($_GET['id'] ?? 0);
$stmt = db()->prepare('SELECT * FROM family_branches WHERE id = ?');
$stmt->execute([$id]);
$branch = $stmt->fetch();
if (!$branch) {
    http_response_code(404);
    die('Branch not found.');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    if (isset($_POST['membership_id'])) {
        $status = $_POST['decision'] === 'approve' ? 'approved' : 'rejected';
        db()->prepare('UPDATE family_branch_memberships SET status=? WHERE id=? AND branch_id=?')->execute([$status, (int) $_POST['membership_id'], $id]);
        write_audit_log($__user['id'], 'familyBranchMembership.' . $status, 'FamilyBranchMembership', $_POST['membership_id']);
    } else {
        db()->prepare('UPDATE family_branches SET name=?, region=?, description=?, historical_information=?, updated_at=NOW() WHERE id=?')->execute([
            trim($_POST['name']), trim($_POST['region'] ?? '') ?: null, trim($_POST['description'] ?? '') ?: null,
            trim($_POST['historical_information'] ?? '') ?: null, $id,
        ]);
        write_audit_log($__user['id'], 'familyBranch.update', 'FamilyBranch', (string) $id);
    }
    flash('success', 'Saved.');
    redirect('/admin/family-branch.php?id=' . $id);
}

$stmt = db()->prepare("SELECT m.*, p.first_name, p.last_name FROM family_branch_memberships m INNER JOIN profiles p ON p.id = m.profile_id WHERE m.branch_id = ? ORDER BY m.created_at ASC");
$stmt->execute([$id]);
$memberships = $stmt->fetchAll();
$pending = array_filter($memberships, fn($m) => $m['status'] === 'pending');
$approved = array_filter($memberships, fn($m) => $m['status'] === 'approved');
?>
<h1 class="display">Edit <?= e($branch['name']) ?></h1>
<form method="post" class="card" style="max-width:520px;">
  <?= csrf_field() ?>
  <div class="field"><label>Name</label><input type="text" name="name" value="<?= e($branch['name']) ?>" required></div>
  <div class="field"><label>Region</label><input type="text" name="region" value="<?= e($branch['region'] ?? '') ?>"></div>
  <div class="field"><label>Description</label><textarea name="description" rows="3"><?= e($branch['description'] ?? '') ?></textarea></div>
  <div class="field"><label>Historical information</label><textarea name="historical_information" rows="4"><?= e($branch['historical_information'] ?? '') ?></textarea></div>
  <button type="submit" class="btn btn-primary btn-sm">Save changes</button>
</form>

<div class="card" style="max-width:520px;">
  <h3>Pending Requests (<?= count($pending) ?>)</h3>
  <?php if (empty($pending)): ?>
    <p class="text-muted">No pending requests</p>
  <?php else: ?>
    <?php foreach ($pending as $m): ?>
      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:8px; margin-top:8px;">
        <span><?= e($m['first_name'] . ' ' . $m['last_name']) ?></span>
        <form method="post" style="display:flex; gap:4px;">
          <?= csrf_field() ?>
          <input type="hidden" name="membership_id" value="<?= $m['id'] ?>">
          <button type="submit" name="decision" value="approve" class="btn btn-primary btn-sm">Approve</button>
          <button type="submit" name="decision" value="reject" class="btn btn-danger btn-sm">Reject</button>
        </form>
      </div>
    <?php endforeach; ?>
  <?php endif; ?>
</div>

<div class="card" style="max-width:520px;">
  <h3>Associated Members (<?= count($approved) ?>)</h3>
  <?php foreach ($approved as $m): ?><p><?= e($m['first_name'] . ' ' . $m['last_name']) ?></p><?php endforeach; ?>
</div>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
