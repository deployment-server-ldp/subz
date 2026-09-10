<?php
require_once __DIR__ . '/functions.php';
$__user = current_user();
$pageTitle = isset($pageTitle) ? $pageTitle . ' | ' . SITE_NAME : SITE_NAME;
$pageDescription = $pageDescription ?? 'Connecting Subzwari families, professionals and communities across the world.';
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($pageTitle) ?></title>
  <meta name="description" content="<?= e($pageDescription) ?>">
  <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
</head>
<body>
<header class="site-header">
  <div class="bar">
    <a class="brand" href="<?= BASE_URL ?>/index.php">SUBZWARI GLOBAL</a>
    <nav class="nav-links">
      <a href="<?= BASE_URL ?>/community.php">Community</a>
      <a href="<?= BASE_URL ?>/members.php">Members</a>
      <a href="<?= BASE_URL ?>/professionals.php">Professionals</a>
      <a href="<?= BASE_URL ?>/businesses.php">Businesses</a>
      <a href="<?= BASE_URL ?>/countries.php">Countries</a>
      <a href="<?= BASE_URL ?>/stories.php">Stories</a>
      <a href="<?= BASE_URL ?>/events.php">Events</a>
    </nav>
    <div class="header-actions">
      <?php if ($__user): ?>
        <a class="btn btn-secondary btn-sm" href="<?= BASE_URL ?>/dashboard/index.php">Dashboard</a>
        <a href="<?= BASE_URL ?>/logout.php">Sign out</a>
      <?php else: ?>
        <a href="<?= BASE_URL ?>/login.php">Sign in</a>
        <a class="btn btn-primary btn-sm" href="<?= BASE_URL ?>/register.php">Join</a>
      <?php endif; ?>
    </div>
  </div>
</header>
<main>
<?php if ($msg = flash('error')): ?>
  <div class="container"><div class="alert alert-error"><?= e($msg) ?></div></div>
<?php endif; ?>
<?php if ($msg = flash('success')): ?>
  <div class="container"><div class="alert alert-success"><?= e($msg) ?></div></div>
<?php endif; ?>
