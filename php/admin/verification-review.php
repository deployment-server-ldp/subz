<?php
$activeNav = 'verification';
$requiredRoles = ['admin', 'verification_manager', 'regional_coordinator'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

$id = (int) ($_GET['id'] ?? 0);
$stmt = db()->prepare('SELECT vr.*, p.first_name, p.last_name, p.country_id, p.city_id, p.user_id, u.email,
        c.name AS country_name, ci.name AS city_name
    FROM verification_requests vr
    INNER JOIN profiles p ON p.id = vr.profile_id
    INNER JOIN users u ON u.id = p.user_id
    LEFT JOIN countries c ON c.id = p.country_id LEFT JOIN cities ci ON ci.id = p.city_id
    WHERE vr.id = ? LIMIT 1');
$stmt->execute([$id]);
$request = $stmt->fetch();
if (!$request) {
    http_response_code(404);
    die('Verification request not found.');
}
$data = json_decode($request['submission_data'], true) ?: [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $decision = $_POST['decision'];
    $notes = trim($_POST['notes'] ?? '');
    $newStatus = $decision === 'approved' ? 'verified' : $decision; // rejected / more_info_requested pass through

    db()->beginTransaction();
    db()->prepare('INSERT INTO verification_reviews (verification_request_id, reviewer_id, decision, notes, created_at) VALUES (?, ?, ?, ?, NOW())')
        ->execute([$request['id'], $__user['id'], $decision, $notes ?: null]);
    db()->prepare('UPDATE verification_requests SET status=?, updated_at=NOW() WHERE id=?')->execute([$newStatus, $request['id']]);
    $isIndexable = $newStatus === 'verified' ? 1 : 0;
    db()->prepare('UPDATE profiles SET verification_status=?, is_indexable = (visibility="public" AND ?), updated_at=NOW() WHERE id=?')
        ->execute([$newStatus, $isIndexable, $request['profile_id']]);
    db()->commit();

    write_audit_log($__user['id'], 'verification.' . $decision, 'Profile', (string) $request['profile_id'], ['requestId' => $request['id'], 'notes' => $notes]);

    if ($decision === 'approved') {
        notify($request['user_id'], 'verification_approved', '/dashboard/index.php');
    } elseif ($decision === 'rejected') {
        notify($request['user_id'], 'verification_rejected', '/dashboard/verification.php');
    } else {
        notify($request['user_id'], 'verification_more_info', '/dashboard/verification.php');
    }

    flash('success', 'Decision recorded.');
    redirect('/admin/verification.php');
}
?>
<h1 class="display"><?= e($request['first_name'] . ' ' . $request['last_name']) ?></h1>
<p class="text-muted"><?= e($request['email']) ?></p>
<p><span class="badge badge-warning"><?= e(str_replace('_', ' ', $request['status'])) ?></span></p>

<div class="card" style="max-width:600px;">
  <h3>Member Information</h3>
  <table>
    <tr><td>Country</td><td><?= e($request['country_name'] ?? '—') ?></td></tr>
    <tr><td>City</td><td><?= e($request['city_name'] ?? '—') ?></td></tr>
  </table>
</div>

<div class="card" style="max-width:600px;">
  <h3>Submitted Family Information</h3>
  <table>
    <tr><td>Father's name</td><td><?= e($data['fathers_name'] ?? '—') ?></td></tr>
    <tr><td>Grandfather's name</td><td><?= e($data['grandfathers_name'] ?? '—') ?></td></tr>
    <tr><td>Great-grandfather's name</td><td><?= e($data['great_grandfathers_name'] ?? '—') ?></td></tr>
    <tr><td>Ancestral region</td><td><?= e($data['ancestral_region'] ?? '—') ?></td></tr>
    <tr><td>Family information</td><td><?= e($data['family_information'] ?? '—') ?></td></tr>
    <tr><td>Additional notes</td><td><?= e($data['additional_notes'] ?? '—') ?></td></tr>
  </table>
</div>

<div class="card" style="max-width:600px;">
  <h3>Decision</h3>
  <form method="post">
    <?= csrf_field() ?>
    <div class="field"><label>Reviewer notes (shown to member for rejections/more-info)</label><textarea name="notes" rows="3"></textarea></div>
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      <button type="submit" name="decision" value="approved" class="btn btn-primary btn-sm">Approve</button>
      <button type="submit" name="decision" value="more_info_requested" class="btn btn-secondary btn-sm">Request More Information</button>
      <button type="submit" name="decision" value="rejected" class="btn btn-danger btn-sm">Reject</button>
    </div>
  </form>
</div>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
