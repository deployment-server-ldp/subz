<?php
$activeNav = 'businesses';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/member_header.php';

$profile = current_profile();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['withdraw_id'])) {
    require_csrf();
    $id = (int) $_POST['withdraw_id'];
    $stmt = db()->prepare('SELECT * FROM businesses WHERE id=? AND owner_id=?');
    $stmt->execute([$id, $profile['id']]);
    $business = $stmt->fetch();
    if ($business && in_array($business['status'], ['pending', 'rejected'], true)) {
        db()->prepare('DELETE FROM businesses WHERE id=?')->execute([$id]);
        flash('success', 'Listing withdrawn.');
    }
    redirect('/dashboard/businesses.php');
}

$stmt = db()->prepare('SELECT b.*, bc.name AS category_name FROM businesses b INNER JOIN business_categories bc ON bc.id=b.category_id WHERE b.owner_id=? ORDER BY b.created_at DESC');
$stmt->execute([$profile['id']]);
$businesses = $stmt->fetchAll();
$tone = ['pending' => 'warning', 'approved' => 'success', 'rejected' => 'danger', 'suspended' => 'danger'];
?>
<div style="display:flex; justify-content:space-between; align-items:center;">
  <h1 class="display">My Businesses</h1>
  <a class="btn btn-primary btn-sm" href="<?= BASE_URL ?>/dashboard/businesses-new.php">Add Business</a>
</div>

<?php if (empty($businesses)): ?>
  <div class="empty-state">No businesses yet. Add your business to the community directory.</div>
<?php else: ?>
  <?php foreach ($businesses as $b): ?>
    <div class="card">
      <div style="display:flex; justify-content:space-between;">
        <div>
          <strong><?= e($b['name']) ?></strong>
          <div class="text-muted"><?= e($b['category_name']) ?></div>
        </div>
        <span class="badge badge-<?= $tone[$b['status']] ?>"><?= e($b['status']) ?></span>
      </div>
      <?php if (in_array($b['status'], ['pending', 'rejected'], true)): ?>
        <form method="post" data-confirm="Withdraw this listing?" style="margin-top:8px;">
          <?= csrf_field() ?>
          <input type="hidden" name="withdraw_id" value="<?= $b['id'] ?>">
          <button type="submit" class="btn btn-danger btn-sm">Withdraw</button>
        </form>
      <?php endif; ?>
    </div>
  <?php endforeach; ?>
<?php endif; ?>
<?php require __DIR__ . '/../includes/member_footer.php'; ?>
