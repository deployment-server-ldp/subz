<?php
$activeNav = 'dashboard';
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/member_header.php';

$profile = current_profile();

// Profile completion (mirrors the Next.js version's weighted checklist).
$checks = [
    'Profile photo' => !empty($profile['photo_path']),
    'Bio' => !empty($profile['bio']),
    'Country' => !empty($profile['country_id']),
    'City' => !empty($profile['city_id']),
    'Profession' => !empty($profile['profession']),
    'Professional details' => !empty($profile['company']) || !empty($profile['job_title']),
    'Education' => !empty($profile['education']),
    'Family information' => !empty($profile['ancestral_region']) || !empty($profile['fathers_name']),
    'Skills' => !empty($profile['skills']),
];
$missing = array_keys(array_filter($checks, fn($ok) => !$ok));
$percent = (int) round((count($checks) - count($missing)) / count($checks) * 100);

$stmt = db()->prepare('SELECT COUNT(*) FROM connections WHERE status="accepted" AND (requester_id=? OR recipient_id=?)');
$stmt->execute([$profile['id'], $profile['id']]);
$connectionCount = (int) $stmt->fetchColumn();

$stmt = db()->prepare('SELECT COUNT(*) FROM event_attendees ea INNER JOIN events e ON e.id=ea.event_id WHERE ea.profile_id=? AND ea.status="going" AND e.starts_at >= NOW()');
$stmt->execute([$profile['id']]);
$upcomingEvents = (int) $stmt->fetchColumn();

$stmt = db()->prepare('SELECT COUNT(*) FROM notifications WHERE recipient_id=? AND is_read=0');
$stmt->execute([$__user['id']]);
$unread = (int) $stmt->fetchColumn();

$stmt = db()->prepare('SELECT COUNT(*) FROM support_requests WHERE requester_id=? AND status IN ("open","in_progress")');
$stmt->execute([$profile['id']]);
$openSupport = (int) $stmt->fetchColumn();

$statusTone = [
    'registered' => 'neutral', 'pending' => 'warning', 'under_review' => 'warning',
    'verified' => 'success', 'rejected' => 'danger', 'more_info_requested' => 'warning', 'suspended' => 'danger',
];
?>
<h1 class="display">Welcome, <?= e($profile['first_name']) ?>.</h1>
<p>
  <?php if ($profile['verification_status'] === 'verified'): ?>
    <span class="badge badge-verified">✓ Verified</span>
  <?php else: ?>
    <span class="badge badge-<?= $statusTone[$profile['verification_status']] ?>"><?= e(str_replace('_', ' ', $profile['verification_status'])) ?></span>
  <?php endif; ?>
</p>

<div class="grid grid-4">
  <div class="card">
    <div class="text-muted">Profile completion</div>
    <div class="display" style="font-size:24px;"><?= $percent ?>%</div>
  </div>
  <div class="card">
    <div class="text-muted">Connections</div>
    <div class="display" style="font-size:24px;"><?= $connectionCount ?></div>
  </div>
  <div class="card">
    <div class="text-muted">Upcoming events</div>
    <div class="display" style="font-size:24px;"><?= $upcomingEvents ?></div>
  </div>
  <div class="card">
    <div class="text-muted">Unread notifications</div>
    <div class="display" style="font-size:24px;"><?= $unread ?></div>
  </div>
</div>

<?php if (!empty($missing)): ?>
<div class="card">
  <h3>Complete your profile</h3>
  <p class="text-muted">Missing: <?= e(implode(', ', $missing)) ?>.</p>
  <a class="btn btn-primary btn-sm" href="<?= BASE_URL ?>/dashboard/profile.php">Complete profile</a>
</div>
<?php endif; ?>

<?php if (in_array($profile['verification_status'], ['registered', 'more_info_requested'], true)): ?>
<div class="card">
  <h3>Get verified</h3>
  <p class="text-muted">Submit your verification request to appear in the community directory.</p>
  <a class="btn btn-primary btn-sm" href="<?= BASE_URL ?>/dashboard/verification.php">Start verification</a>
</div>
<?php endif; ?>

<div class="card">
  <h3>Quick actions</h3>
  <div style="display:flex; flex-wrap:wrap; gap:8px;">
    <a class="btn btn-secondary btn-sm" href="<?= BASE_URL ?>/dashboard/profile.php">Complete Profile</a>
    <a class="btn btn-secondary btn-sm" href="<?= BASE_URL ?>/network/index.php">Find Subzwari</a>
    <a class="btn btn-secondary btn-sm" href="<?= BASE_URL ?>/dashboard/businesses-new.php">Add Business</a>
    <a class="btn btn-secondary btn-sm" href="<?= BASE_URL ?>/events.php">Explore Events</a>
    <a class="btn btn-secondary btn-sm" href="<?= BASE_URL ?>/dashboard/moments-new.php">Share a Moment</a>
  </div>
</div>

<?php if ($openSupport > 0): ?>
  <p class="text-muted">You have <?= $openSupport ?> open support request(s). <a href="<?= BASE_URL ?>/dashboard/support.php">View them</a>.</p>
<?php endif; ?>

<?php require __DIR__ . '/../includes/member_footer.php'; ?>
