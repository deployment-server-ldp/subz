<?php
$activeNav = 'businesses';
$requiredRoles = ['admin', 'regional_coordinator'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

$id = (int) ($_GET['id'] ?? 0);
$stmt = db()->prepare(
    "SELECT b.*, p.first_name, p.last_name, p.user_id, bc.name AS category_name, co.name AS country_name
     FROM businesses b
     INNER JOIN profiles p ON p.id = b.owner_id
     INNER JOIN business_categories bc ON bc.id = b.category_id
     INNER JOIN countries co ON co.id = b.country_id
     WHERE b.id = ? LIMIT 1"
);
$stmt->execute([$id]);
$business = $stmt->fetch();
if (!$business) {
    http_response_code(404);
    die('Business not found.');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $status = $_POST['status'];
    db()->prepare('UPDATE businesses SET status=?, updated_at=NOW() WHERE id=?')->execute([$status, $id]);
    write_audit_log($__user['id'], 'business.' . $status, 'Business', (string) $id);
    if ($status === 'approved') {
        notify($business['user_id'], 'business_approved', '/business.php?slug=' . $business['slug']);
    }
    flash('success', 'Decision recorded.');
    redirect('/admin/businesses.php');
}
?>
<h1 class="display"><?= e($business['name']) ?></h1>
<span class="badge badge-warning"><?= e($business['status']) ?></span>

<div class="card" style="max-width:560px;">
  <table>
    <tr><td>Owner</td><td><?= e($business['first_name'] . ' ' . $business['last_name']) ?></td></tr>
    <tr><td>Category</td><td><?= e($business['category_name']) ?></td></tr>
    <tr><td>Country</td><td><?= e($business['country_name']) ?></td></tr>
    <tr><td>Website</td><td><?= e($business['website'] ?? '—') ?></td></tr>
    <tr><td>Contact</td><td><?= e($business['contact_method'] ?? '—') ?></td></tr>
    <tr><td>Description</td><td><?= e($business['description']) ?></td></tr>
  </table>
</div>

<form method="post" style="margin-top:16px; display:flex; gap:8px;">
  <?= csrf_field() ?>
  <button type="submit" name="status" value="approved" class="btn btn-primary btn-sm">Approve</button>
  <button type="submit" name="status" value="rejected" class="btn btn-danger btn-sm">Reject</button>
  <button type="submit" name="status" value="suspended" class="btn btn-secondary btn-sm">Suspend</button>
</form>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
