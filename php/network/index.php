<?php
$activeNav = 'network';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/member_header.php';
require __DIR__ . '/../includes/directory_filters.php';

$profile = current_profile();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['connect_id'])) {
    require_csrf();
    $targetId = (int) $_POST['connect_id'];
    $exists = db()->prepare("SELECT id FROM connections WHERE status IN ('pending','accepted') AND ((requester_id=? AND recipient_id=?) OR (requester_id=? AND recipient_id=?))");
    $exists->execute([$profile['id'], $targetId, $targetId, $profile['id']]);
    if (!$exists->fetch()) {
        db()->prepare('INSERT INTO connections (requester_id, recipient_id, status, created_at) VALUES (?, ?, "pending", NOW())')->execute([$profile['id'], $targetId]);
        $stmt = db()->prepare('SELECT user_id FROM profiles WHERE id=?');
        $stmt->execute([$targetId]);
        notify((int) $stmt->fetchColumn(), 'connection_request', '/network/requests.php');
        flash('success', 'Connection request sent.');
    } else {
        flash('error', 'A connection already exists or is pending.');
    }
    redirect('/network/index.php?' . http_build_query($_GET));
}

$countries = db()->query('SELECT * FROM countries ORDER BY display_order ASC')->fetchAll();
$filters = [
    'q' => trim($_GET['q'] ?? ''), 'country_id' => $_GET['country_id'] ?? '', 'industry' => trim($_GET['industry'] ?? ''),
    'open_to_networking' => $_GET['open_to_networking'] ?? '', 'open_to_mentorship' => $_GET['open_to_mentorship'] ?? '',
    'page' => (int) ($_GET['page'] ?? 1),
];
['results' => $members, 'pagination' => $pagination] = search_profiles($filters, true);
$members = array_filter($members, fn($m) => (int) $m['id'] !== (int) $profile['id']);
?>
<h1 class="display">Discover Subzwari</h1>
<p class="text-muted">Find and connect with other verified Subzwari members around the world.</p>

<?php render_directory_filters($countries); ?>

<?php if (empty($members)): ?>
  <div class="empty-state">No members found. Try adjusting your filters.</div>
<?php else: ?>
  <div class="grid grid-3" style="margin-top:24px;">
    <?php foreach ($members as $m): ?>
      <div class="card">
        <a href="<?= BASE_URL ?>/member.php?slug=<?= e($m['slug']) ?>">
          <strong><?= e($m['first_name'] . ' ' . $m['last_name']) ?></strong>
          <div class="text-muted"><?= e(trim(($m['city_name'] ?? '') . ', ' . ($m['country_name'] ?? ''), ', ')) ?: 'Location not set' ?></div>
          <?php if ($m['profession']): ?><div class="text-muted"><?= e($m['profession']) ?></div><?php endif; ?>
          <div style="margin-top:8px;"><span class="badge badge-verified">✓ Verified</span></div>
        </a>
        <form method="post" style="margin-top:8px;">
          <?= csrf_field() ?>
          <input type="hidden" name="connect_id" value="<?= $m['id'] ?>">
          <button type="submit" class="btn btn-secondary btn-sm">Connect</button>
        </form>
      </div>
    <?php endforeach; ?>
  </div>
<?php endif; ?>

<div class="pagination">
  <?php for ($i = 1; $i <= $pagination['totalPages']; $i++): ?>
    <a href="?<?= query_string_with(['page' => $i]) ?>" class="<?= $i === $pagination['page'] ? 'active' : '' ?>"><?= $i ?></a>
  <?php endfor; ?>
</div>
<?php require __DIR__ . '/../includes/member_footer.php'; ?>
