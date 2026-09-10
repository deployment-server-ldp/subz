<?php
$activeNav = 'members';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

$q = trim($_GET['q'] ?? '');
$status = $_GET['status'] ?? '';
$page = max(1, (int) ($_GET['page'] ?? 1));

$where = [];
$params = [];
if ($q !== '') {
    $where[] = '(p.first_name LIKE ? OR p.last_name LIKE ? OR u.email LIKE ?)';
    $params[] = "%$q%"; $params[] = "%$q%"; $params[] = "%$q%";
}
if ($status !== '') {
    $where[] = 'p.verification_status = ?';
    $params[] = $status;
}
$whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

$countStmt = db()->prepare("SELECT COUNT(*) FROM profiles p INNER JOIN users u ON u.id=p.user_id $whereSql");
$countStmt->execute($params);
$total = (int) $countStmt->fetchColumn();

$pagination = paginate($page, $total, 20);
$stmt = db()->prepare("SELECT p.*, u.email, c.name AS country_name FROM profiles p
    INNER JOIN users u ON u.id = p.user_id LEFT JOIN countries c ON c.id = p.country_id
    $whereSql ORDER BY p.created_at DESC LIMIT {$pagination['perPage']} OFFSET {$pagination['offset']}");
$stmt->execute($params);
$members = $stmt->fetchAll();

$statusTone = ['registered' => 'neutral', 'pending' => 'warning', 'under_review' => 'warning', 'verified' => 'success', 'rejected' => 'danger', 'more_info_requested' => 'warning', 'suspended' => 'danger'];
?>
<h1 class="display">Members</h1>
<form method="get" class="field-row" style="align-items:flex-end;">
  <div class="field"><label>Search</label><input type="text" name="q" value="<?= e($q) ?>" placeholder="Name or email"></div>
  <div class="field">
    <label>Status</label>
    <select name="status">
      <option value="">All statuses</option>
      <?php foreach (array_keys($statusTone) as $s): ?>
        <option value="<?= $s ?>" <?= $status === $s ? 'selected' : '' ?>><?= e(str_replace('_', ' ', ucfirst($s))) ?></option>
      <?php endforeach; ?>
    </select>
  </div>
  <div class="field"><button type="submit" class="btn btn-primary btn-sm">Filter</button></div>
</form>

<?php if (empty($members)): ?>
  <div class="empty-state">No members found</div>
<?php else: ?>
  <table>
    <tr><th>Name</th><th>Email</th><th>Country</th><th>Status</th><th></th></tr>
    <?php foreach ($members as $member): ?>
      <tr>
        <td><?= e($member['first_name'] . ' ' . $member['last_name']) ?></td>
        <td><?= e($member['email']) ?></td>
        <td><?= e($member['country_name'] ?? '—') ?></td>
        <td><span class="badge badge-<?= $statusTone[$member['verification_status']] ?>"><?= e(str_replace('_', ' ', $member['verification_status'])) ?></span></td>
        <td><a href="<?= BASE_URL ?>/admin/member.php?id=<?= $member['id'] ?>">View</a></td>
      </tr>
    <?php endforeach; ?>
  </table>
<?php endif; ?>

<div class="pagination">
  <?php for ($i = 1; $i <= $pagination['totalPages']; $i++): ?>
    <a href="?<?= query_string_with(['page' => $i]) ?>" class="<?= $i === $pagination['page'] ? 'active' : '' ?>"><?= $i ?></a>
  <?php endfor; ?>
</div>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
