<?php
$activeNav = 'businesses';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

$businesses = db()->query(
    "SELECT b.*, p.first_name, p.last_name, bc.name AS category_name, co.name AS country_name
     FROM businesses b
     INNER JOIN profiles p ON p.id = b.owner_id
     INNER JOIN business_categories bc ON bc.id = b.category_id
     INNER JOIN countries co ON co.id = b.country_id
     ORDER BY b.created_at DESC"
)->fetchAll();
$tone = ['pending' => 'warning', 'approved' => 'success', 'rejected' => 'danger', 'suspended' => 'danger'];
?>
<h1 class="display">Businesses</h1>
<?php if (empty($businesses)): ?>
  <div class="empty-state">No businesses submitted yet</div>
<?php else: ?>
  <table>
    <tr><th>Name</th><th>Owner</th><th>Category</th><th>Country</th><th>Status</th><th></th></tr>
    <?php foreach ($businesses as $b): ?>
      <tr>
        <td><?= e($b['name']) ?></td>
        <td><?= e($b['first_name'] . ' ' . $b['last_name']) ?></td>
        <td><?= e($b['category_name']) ?></td>
        <td><?= e($b['country_name']) ?></td>
        <td><span class="badge badge-<?= $tone[$b['status']] ?>"><?= e($b['status']) ?></span></td>
        <td><a href="<?= BASE_URL ?>/admin/business-review.php?id=<?= $b['id'] ?>">Review</a></td>
      </tr>
    <?php endforeach; ?>
  </table>
<?php endif; ?>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
