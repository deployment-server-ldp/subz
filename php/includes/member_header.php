<?php
require_once __DIR__ . '/functions.php';
$__user = require_login();
$__profile = current_profile();

$unreadCount = 0;
if ($__profile) {
    $stmt = db()->prepare('SELECT COUNT(*) FROM notifications WHERE recipient_id = ? AND is_read = 0');
    $stmt->execute([$__user['id']]);
    $unreadCount = (int) $stmt->fetchColumn();
}

$pageTitle = isset($pageTitle) ? $pageTitle . ' | ' . SITE_NAME : SITE_NAME;
$activeNav = $activeNav ?? '';

$navItems = [
    'dashboard' => ['Overview', '/dashboard/index.php'],
    'profile' => ['Profile', '/dashboard/profile.php'],
    'verification' => ['Verification', '/dashboard/verification.php'],
    'businesses' => ['My Businesses', '/dashboard/businesses.php'],
    'events' => ['My Events', '/dashboard/events.php'],
    'support' => ['Community Support', '/dashboard/support.php'],
    'network' => ['Discover', '/network/index.php'],
    'connections' => ['Connections', '/network/connections.php'],
    'requests' => ['Requests', '/network/requests.php'],
    'notifications' => ['Notifications', '/notifications/index.php'],
    'settings' => ['Settings', '/dashboard/settings.php'],
];
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($pageTitle) ?></title>
  <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
</head>
<body>
<div class="shell">
  <aside class="sidebar">
    <a class="brand" href="<?= BASE_URL ?>/index.php">SUBZWARI GLOBAL</a>
    <nav>
      <?php foreach ($navItems as $key => [$label, $href]): ?>
        <a href="<?= BASE_URL . $href ?>" class="<?= $activeNav === $key ? 'active' : '' ?>">
          <?= e($label) ?><?= $key === 'notifications' && $unreadCount > 0 ? ' (' . $unreadCount . ')' : '' ?>
        </a>
      <?php endforeach; ?>
    </nav>
    <p style="margin-top:32px;"><a href="<?= BASE_URL ?>/logout.php" class="text-muted">Sign out</a></p>
  </aside>
  <main class="main">
    <?php if ($msg = flash('error')): ?><div class="alert alert-error"><?= e($msg) ?></div><?php endif; ?>
    <?php if ($msg = flash('success')): ?><div class="alert alert-success"><?= e($msg) ?></div><?php endif; ?>
