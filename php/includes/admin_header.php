<?php
require_once __DIR__ . '/functions.php';
// A page can set $requiredRoles = ['admin', 'moderator'] before including
// this file to restrict further than "any staff role"; Super Admin always
// passes. Default (unset) allows any staff role in.
$__user = require_role($requiredRoles ?? []);

$pageTitle = isset($pageTitle) ? $pageTitle . ' | Admin | ' . SITE_NAME : 'Admin | ' . SITE_NAME;
$activeNav = $activeNav ?? '';

$navItems = [
    'dashboard' => ['Dashboard', '/admin/index.php'],
    'members' => ['Members', '/admin/members.php'],
    'verification' => ['Verification', '/admin/verification.php'],
    'family-branches' => ['Family Branches', '/admin/family-branches.php'],
    'countries' => ['Countries', '/admin/countries.php'],
    'cities' => ['Cities', '/admin/cities.php'],
    'professional-categories' => ['Professional Categories', '/admin/professional-categories.php'],
    'businesses' => ['Businesses', '/admin/businesses.php'],
    'business-categories' => ['Business Categories', '/admin/business-categories.php'],
    'events' => ['Events', '/admin/events.php'],
    'stories' => ['Stories', '/admin/stories.php'],
    'story-categories' => ['Story Categories', '/admin/story-categories.php'],
    'moments' => ['Moments', '/admin/moments.php'],
    'support-requests' => ['Support Requests', '/admin/support-requests.php'],
    'reports' => ['Reports', '/admin/reports.php'],
    'admins' => ['Admins', '/admin/admins.php'],
    'settings' => ['Settings', '/admin/settings.php'],
    'cms-pages' => ['CMS Pages', '/admin/cms-pages.php'],
    'audit-logs' => ['Audit Logs', '/admin/audit-logs.php'],
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
<div class="shell" style="max-width:1300px;">
  <aside class="sidebar" style="overflow-y:auto; max-height:100vh;">
    <a class="brand" href="<?= BASE_URL ?>/index.php">SUBZWARI ADMIN</a>
    <nav>
      <?php foreach ($navItems as $key => [$label, $href]): ?>
        <a href="<?= BASE_URL . $href ?>" class="<?= $activeNav === $key ? 'active' : '' ?>"><?= e($label) ?></a>
      <?php endforeach; ?>
    </nav>
    <p style="margin-top:32px;"><a href="<?= BASE_URL ?>/logout.php" class="text-muted">Sign out</a></p>
  </aside>
  <main class="main">
    <?php if ($msg = flash('error')): ?><div class="alert alert-error"><?= e($msg) ?></div><?php endif; ?>
    <?php if ($msg = flash('success')): ?><div class="alert alert-success"><?= e($msg) ?></div><?php endif; ?>
