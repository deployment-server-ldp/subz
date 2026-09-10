<?php
require_once __DIR__ . '/includes/functions.php';

$pageTitle = 'Member Directory';
$viewerSignedIn = (bool) current_user();
$countries = db()->query('SELECT * FROM countries ORDER BY display_order ASC')->fetchAll();

$filters = [
    'q' => trim($_GET['q'] ?? ''),
    'country_id' => $_GET['country_id'] ?? '',
    'city_id' => $_GET['city_id'] ?? '',
    'industry' => trim($_GET['industry'] ?? ''),
    'open_to_networking' => $_GET['open_to_networking'] ?? '',
    'open_to_mentorship' => $_GET['open_to_mentorship'] ?? '',
    'page' => (int) ($_GET['page'] ?? 1),
];
['results' => $members, 'pagination' => $pagination] = search_profiles($filters, $viewerSignedIn);

require __DIR__ . '/includes/header.php';
require __DIR__ . '/includes/directory_filters.php';
?>
<div class="container" style="padding:64px 24px;">
  <h1 class="display">Member Directory</h1>
  <p class="text-muted">Find verified Subzwari members around the world. Only verified, visible profiles appear here.</p>

  <?php render_directory_filters($countries); ?>

  <?php if (empty($members)): ?>
    <div class="empty-state">No members found. Try adjusting your filters.</div>
  <?php else: ?>
    <div class="grid grid-3" style="margin-top:24px;">
      <?php foreach ($members as $m): ?>
        <a class="card" href="<?= BASE_URL ?>/member.php?slug=<?= e($m['slug']) ?>">
          <strong><?= e($m['first_name'] . ' ' . $m['last_name']) ?></strong>
          <div class="text-muted"><?= e(trim(($m['city_name'] ?? '') . ', ' . ($m['country_name'] ?? ''), ', ')) ?: 'Location not set' ?></div>
          <?php if ($m['profession']): ?><div class="text-muted"><?= e($m['profession']) ?></div><?php endif; ?>
          <div style="margin-top:8px;"><span class="badge badge-verified">✓ Verified</span></div>
        </a>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>

  <div class="pagination">
    <?php for ($i = 1; $i <= $pagination['totalPages']; $i++): ?>
      <a href="?<?= query_string_with(['page' => $i]) ?>" class="<?= $i === $pagination['page'] ? 'active' : '' ?>"><?= $i ?></a>
    <?php endfor; ?>
  </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
