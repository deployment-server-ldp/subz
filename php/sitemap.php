<?php
require_once __DIR__ . '/includes/functions.php';
header('Content-Type: application/xml; charset=utf-8');

$staticRoutes = [
    '', 'about.php', 'history.php', 'community.php', 'members.php', 'professionals.php',
    'businesses.php', 'countries.php', 'family.php', 'stories.php', 'moments.php', 'events.php',
    'contact.php', 'privacy.php', 'terms.php', 'community-guidelines.php', 'verification-info.php',
];

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

foreach ($staticRoutes as $route) {
    echo '<url><loc>' . e(BASE_URL . '/' . $route) . '</loc></url>' . "\n";
}

$countries = db()->query('SELECT slug FROM countries')->fetchAll();
foreach ($countries as $c) { echo '<url><loc>' . e(BASE_URL . '/country.php?slug=' . $c['slug']) . '</loc></url>' . "\n"; }

$cities = db()->query('SELECT slug FROM cities')->fetchAll();
foreach ($cities as $c) { echo '<url><loc>' . e(BASE_URL . '/city.php?slug=' . $c['slug']) . '</loc></url>' . "\n"; }

$businesses = db()->query("SELECT slug FROM businesses WHERE status='approved'")->fetchAll();
foreach ($businesses as $b) { echo '<url><loc>' . e(BASE_URL . '/business.php?slug=' . $b['slug']) . '</loc></url>' . "\n"; }

$events = db()->query("SELECT slug FROM events WHERE status='published'")->fetchAll();
foreach ($events as $ev) { echo '<url><loc>' . e(BASE_URL . '/event.php?slug=' . $ev['slug']) . '</loc></url>' . "\n"; }

$stories = db()->query("SELECT slug FROM stories WHERE status='published' AND deleted_at IS NULL")->fetchAll();
foreach ($stories as $s) { echo '<url><loc>' . e(BASE_URL . '/story.php?slug=' . $s['slug']) . '</loc></url>' . "\n"; }

$profiles = db()->query('SELECT slug FROM profiles WHERE is_indexable = 1')->fetchAll();
foreach ($profiles as $p) { echo '<url><loc>' . e(BASE_URL . '/member.php?slug=' . $p['slug']) . '</loc></url>' . "\n"; }

echo '</urlset>';
