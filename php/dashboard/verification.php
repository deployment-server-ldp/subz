<?php
$activeNav = 'verification';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/member_header.php';

$profile = current_profile();
$canSubmit = in_array($profile['verification_status'], ['registered', 'rejected', 'more_info_requested'], true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $canSubmit) {
    require_csrf();
    $submissionData = json_encode([
        'first_name' => $profile['first_name'],
        'last_name' => $profile['last_name'],
        'fathers_name' => $profile['fathers_name'],
        'grandfathers_name' => $profile['grandfathers_name'],
        'great_grandfathers_name' => $profile['great_grandfathers_name'],
        'ancestral_region' => $profile['ancestral_region'],
        'family_information' => $profile['family_information'],
        'additional_notes' => trim($_POST['additional_notes'] ?? ''),
        'submitted_at' => date('c'),
    ]);

    db()->beginTransaction();
    db()->prepare('INSERT INTO verification_requests (profile_id, submission_data, status, created_at, updated_at) VALUES (?, ?, "pending", NOW(), NOW())')
        ->execute([$profile['id'], $submissionData]);
    db()->prepare('UPDATE profiles SET verification_status="pending", updated_at=NOW() WHERE id=?')->execute([$profile['id']]);
    db()->commit();

    flash('success', 'Verification request submitted.');
    redirect('/dashboard/verification.php');
}

$stmt = db()->prepare('SELECT * FROM verification_requests WHERE profile_id=? ORDER BY created_at DESC');
$stmt->execute([$profile['id']]);
$requests = $stmt->fetchAll();
foreach ($requests as &$request) {
    $stmt2 = db()->prepare('SELECT vr.*, u.email AS reviewer_email FROM verification_reviews vr INNER JOIN users u ON u.id = vr.reviewer_id WHERE verification_request_id=? ORDER BY created_at DESC');
    $stmt2->execute([$request['id']]);
    $request['reviews'] = $stmt2->fetchAll();
}
unset($request);

$statusTone = ['registered' => 'neutral', 'pending' => 'warning', 'under_review' => 'warning', 'verified' => 'success', 'rejected' => 'danger', 'more_info_requested' => 'warning', 'suspended' => 'danger'];
?>
<h1 class="display">Verification</h1>
<p><span class="badge badge-<?= $statusTone[$profile['verification_status']] ?>"><?= $profile['verification_status'] === 'verified' ? '✓ Verified' : e(str_replace('_', ' ', $profile['verification_status'])) ?></span></p>

<?php if ($canSubmit): ?>
  <div class="card" style="max-width:600px;">
    <p class="text-muted">We'll review the family and personal information already on your profile. Add anything else that could help a reviewer confirm your identity — no government documents required.</p>
    <form method="post">
      <?= csrf_field() ?>
      <div class="field"><label>Additional notes (optional)</label><textarea name="additional_notes" rows="4"></textarea></div>
      <button type="submit" class="btn btn-primary">Submit for verification</button>
    </form>
  </div>
<?php elseif (in_array($profile['verification_status'], ['pending', 'under_review'], true)): ?>
  <div class="card">Your verification request is being reviewed by our community team.</div>
<?php endif; ?>

<?php if (!empty($requests)): ?>
  <h2 style="font-size:18px; margin-top:32px;">History</h2>
  <?php foreach ($requests as $request): ?>
    <div class="card">
      <p class="text-muted">Submitted <?= date('M j, Y', strtotime($request['created_at'])) ?> — status <?= e(str_replace('_', ' ', $request['status'])) ?></p>
      <?php foreach ($request['reviews'] as $review): ?>
        <div style="border-top:1px solid var(--border); margin-top:8px; padding-top:8px;">
          <strong><?= e(str_replace('_', ' ', $review['decision'])) ?></strong>
          <?php if ($review['notes']): ?><p class="text-muted"><?= e($review['notes']) ?></p><?php endif; ?>
          <p class="text-muted" style="font-size:12px;"><?= e($review['created_at']) ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  <?php endforeach; ?>
<?php endif; ?>

<?php require __DIR__ . '/../includes/member_footer.php'; ?>
