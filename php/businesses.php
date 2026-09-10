<?php
require_once __DIR__ . '/includes/functions.php';

$pageTitle = 'SUBZWARI Businesses';
$q = trim($_GET['q'] ?? '');
$countryId = $_GET['country_id'] ?? '';
$categoryId = $_GET['category_id'] ?? '';

$where = ["b.status = 'approved'"];
$params = [];
if ($q !== '') { $where[] = 'b.name LIKE ?'; $params[] = "%$q%"; }
if ($countryId !== '') { $where[] = 'b.country_id = ?'; $params[] = $countryId; }
if ($categoryId !== '') { $where[] = 'b.category_id = ?'; $params[] = $categoryId; }
$whereSql = 'WHERE ' . implode(' AND ', $where);

$stmt = db()->prepare("SELECT b.*, bc.name AS category_name, co.name AS country_name, ci.name AS city_name
    FROM businesses b INNER JOIN business_categories bc ON bc.id=b.category_id INNER JOIN countries co ON co.id=b.country_id
    LEFT JOIN cities ci ON ci.id=b.city_id $whereSql ORDER BY b.created_at DESC");
$stmt->execute($params);
$businesses = $stmt->fetchAll();

$countries = db()->query('SELECT * FROM countries ORDER BY display_order ASC')->fetchAll();
$categories = db()->query('SELECT * FROM business_categories ORDER BY display_order ASC')->fetchAll();

require __DIR__ . '/includes/header.php';
?>
<div class="container" style="padding:64px 24px;">
  <h1 class="display">SUBZWARI Businesses</h1>
  <p class="text-muted">Discover Subzwari-owned businesses around the world.</p>

  <form method="get" class="card field-row" style="align-items:flex-end;">
    <div class="field"><label>Search</label><input type="text" name="q" value="<?= e($q) ?>"></div>
    <div class="field">
      <label>Country</label>
      <select name="country_id">
        <option value="">All countries</option>
        <?php foreach ($countries as $c): ?><option value="<?= $c['id'] ?>" <?= (string) $countryId === (string) $c['id'] ? 'selected' : '' ?>><?= e($c['name']) ?></option><?php endforeach; ?>
      </select>
    </div>
    <div class="field">
      <label>Category</label>
      <select name="category_id">
        <option value="">All categories</option>
        <?php foreach ($categories as $c): ?><option value="<?= $c['id'] ?>" <?= (string) $categoryId === (string) $c['id'] ? 'selected' : '' ?>><?= e($c['name']) ?></option><?php endforeach; ?>
      </select>
    </div>
    <div class="field"><button type="submit" class="btn btn-primary btn-sm">Filter</button></div>
  </form>

  <?php if (empty($businesses)): ?>
    <div class="empty-state">No businesses found. Try adjusting your filters, or add your own.</div>
  <?php else: ?>
    <div class="grid grid-3" style="margin-top:24px;">
      <?php foreach ($businesses as $b): ?>
        <a class="card" href="<?= BASE_URL ?>/business.php?slug=<?= e($b['slug']) ?>">
          <strong><?= e($b['name']) ?></strong>
          <div class="text-muted"><?= e($b['category_name']) ?></div>
          <div class="text-muted"><?= e(trim(($b['city_name'] ?? '') . ', ' . $b['country_name'], ', ')) ?></div>
        </a>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
