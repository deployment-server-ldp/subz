<?php
$activeNav = 'family-branches';
$requiredRoles = ['admin', 'regional_coordinator'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $name = trim($_POST['name'] ?? '');
    if ($name !== '') {
        $slug = slugify($name);
        $exists = db()->prepare('SELECT id FROM family_branches WHERE slug=?');
        $exists->execute([$slug]);
        if ($exists->fetch()) {
            flash('error', 'A branch with that name already exists.');
        } else {
            db()->prepare('INSERT INTO family_branches (name, slug, description, region, historical_information, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())')
                ->execute([$name, $slug, trim($_POST['description'] ?? '') ?: null, trim($_POST['region'] ?? '') ?: null, trim($_POST['historical_information'] ?? '') ?: null]);
            write_audit_log($__user['id'], 'familyBranch.create', 'FamilyBranch', $slug);
            flash('success', 'Branch created.');
        }
    }
    redirect('/admin/family-branches.php');
}

$branches = db()->query(
    "SELECT fb.*, (SELECT COUNT(*) FROM family_branch_memberships m WHERE m.branch_id=fb.id) AS membership_count
     FROM family_branches fb WHERE fb.deleted_at IS NULL ORDER BY fb.name ASC"
)->fetchAll();
?>
<h1 class="display">Family Branches</h1>
<form method="post" class="card" style="max-width:520px;">
  <?= csrf_field() ?>
  <div class="field"><label>Branch name</label><input type="text" name="name" required></div>
  <div class="field"><label>Region</label><input type="text" name="region"></div>
  <div class="field"><label>Description</label><textarea name="description" rows="3"></textarea></div>
  <div class="field"><label>Historical information</label><textarea name="historical_information" rows="4"></textarea></div>
  <button type="submit" class="btn btn-primary btn-sm">Add Branch</button>
</form>
<table>
  <tr><th>Name</th><th>Region</th><th>Members</th><th></th></tr>
  <?php foreach ($branches as $b): ?>
    <tr>
      <td><?= e($b['name']) ?></td>
      <td><?= e($b['region'] ?? '—') ?></td>
      <td><?= (int) $b['membership_count'] ?></td>
      <td><a href="<?= BASE_URL ?>/admin/family-branch.php?id=<?= $b['id'] ?>">Manage</a></td>
    </tr>
  <?php endforeach; ?>
</table>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
