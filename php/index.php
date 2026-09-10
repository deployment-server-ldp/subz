<?php
require_once __DIR__ . '/includes/functions.php';

$heroTitle = get_setting('general', 'hero_title', 'SUBZWARI GLOBAL');
$heroSubtitle = get_setting('general', 'hero_subtitle', "SUBZWARI's ARE ONE");
$heroDescription = get_setting('general', 'hero_description', 'Connecting Subzwari families, professionals and communities across the world.');

$stats = [
    'verified_members' => (int) db()->query("SELECT COUNT(*) FROM profiles WHERE verification_status='verified'")->fetchColumn(),
    'countries' => (int) db()->query("SELECT COUNT(DISTINCT country_id) FROM profiles WHERE verification_status='verified' AND country_id IS NOT NULL")->fetchColumn(),
    'cities' => (int) db()->query("SELECT COUNT(DISTINCT city_id) FROM profiles WHERE verification_status='verified' AND city_id IS NOT NULL")->fetchColumn(),
    'professionals' => (int) db()->query("SELECT COUNT(DISTINCT p.id) FROM profiles p INNER JOIN profile_professional_categories c ON c.profile_id=p.id WHERE p.verification_status='verified'")->fetchColumn(),
    'businesses' => (int) db()->query("SELECT COUNT(*) FROM businesses WHERE status='approved'")->fetchColumn(),
    'events' => (int) db()->query("SELECT COUNT(*) FROM events WHERE status='published'")->fetchColumn(),
];

$countries = db()->query(
    "SELECT c.*, (SELECT COUNT(*) FROM profiles p WHERE p.country_id=c.id AND p.verification_status='verified') AS member_count
     FROM countries c ORDER BY display_order ASC LIMIT 12"
)->fetchAll();

$featuredMembers = db()->query(
    "SELECT p.*, c.name AS country_name, ci.name AS city_name FROM profiles p
     LEFT JOIN countries c ON c.id = p.country_id LEFT JOIN cities ci ON ci.id = p.city_id
     WHERE p.verification_status='verified' AND p.visibility='public'
     ORDER BY p.updated_at DESC LIMIT 6"
)->fetchAll();

$categories = db()->query('SELECT * FROM professional_categories ORDER BY display_order ASC LIMIT 10')->fetchAll();

$stories = db()->query("SELECT * FROM stories WHERE status='published' ORDER BY published_at DESC LIMIT 3")->fetchAll();

$pageTitle = null; // homepage uses the bare site name
require __DIR__ . '/includes/header.php';
?>
<section class="hero">
  <p class="kicker">One Name. One Community. One Network.</p>
  <h1><?= e($heroTitle) ?></h1>
  <h2><?= e($heroSubtitle) ?></h2>
  <p><?= e($heroDescription) ?></p>
  <div class="hero-actions">
    <a class="btn btn-primary" href="<?= BASE_URL ?>/register.php">JOIN THE COMMUNITY</a>
    <a class="btn btn-secondary" href="<?= BASE_URL ?>/community.php">EXPLORE THE COMMUNITY</a>
  </div>
</section>

<section class="section section-muted">
  <h2>Global Community</h2>
  <div class="container grid grid-4" style="margin-top:32px;">
    <div class="stat"><div class="value"><?= $stats['verified_members'] ?></div><div class="label">Verified Members</div></div>
    <div class="stat"><div class="value"><?= $stats['countries'] ?></div><div class="label">Countries</div></div>
    <div class="stat"><div class="value"><?= $stats['cities'] ?></div><div class="label">Cities</div></div>
    <div class="stat"><div class="value"><?= $stats['professionals'] ?></div><div class="label">Professionals</div></div>
    <div class="stat"><div class="value"><?= $stats['businesses'] ?></div><div class="label">Businesses</div></div>
    <div class="stat"><div class="value"><?= $stats['events'] ?></div><div class="label">Community Events</div></div>
  </div>
</section>

<section class="section container">
  <h2 style="text-align:left;">Subzwari Around the World</h2>
  <?php if (empty($countries)): ?>
    <div class="empty-state">No communities yet — be the first verified Subzwari from your country.</div>
  <?php else: ?>
    <div class="grid grid-4" style="margin-top:24px;">
      <?php foreach ($countries as $country): ?>
        <a class="card" href="<?= BASE_URL ?>/country.php?slug=<?= e($country['slug']) ?>" style="text-align:center;">
          <strong><?= e($country['name']) ?></strong>
          <div class="text-muted"><?= (int) $country['member_count'] ?> members</div>
        </a>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</section>

<section class="section section-muted">
  <div class="container">
    <h2>Meet Our Community</h2>
    <?php if (empty($featuredMembers)): ?>
      <div class="empty-state">Verified public profiles will be featured here as the community grows.</div>
    <?php else: ?>
      <div class="grid grid-3" style="margin-top:24px;">
        <?php foreach ($featuredMembers as $member): ?>
          <a class="card" href="<?= BASE_URL ?>/member.php?slug=<?= e($member['slug']) ?>">
            <strong><?= e($member['first_name'] . ' ' . $member['last_name']) ?></strong>
            <div class="text-muted"><?= e(trim(($member['city_name'] ?? '') . ', ' . ($member['country_name'] ?? ''), ', ')) ?: 'Location not set' ?></div>
            <?php if ($member['profession']): ?><div class="text-muted"><?= e($member['profession']) ?></div><?php endif; ?>
            <div style="margin-top:8px;"><span class="badge badge-verified">✓ Verified</span></div>
          </a>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</section>

<section class="section container">
  <h2 style="text-align:left;">SUBZWARI Professional Network</h2>
  <p class="text-muted">Connect with Subzwari professionals across industries for mentorship, referrals, and business introductions.</p>
  <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:16px;">
    <?php foreach ($categories as $category): ?>
      <a class="badge badge-neutral" href="<?= BASE_URL ?>/professionals.php?category_id=<?= (int) $category['id'] ?>"><?= e($category['name']) ?></a>
    <?php endforeach; ?>
  </div>
  <p style="margin-top:24px;"><a class="btn btn-secondary" href="<?= BASE_URL ?>/professionals.php">Explore the Professional Network</a></p>
</section>

<?php if (!empty($stories)): ?>
<section class="section section-muted">
  <div class="container">
    <h2>Subzwari Stories</h2>
    <div class="grid grid-3" style="margin-top:24px;">
      <?php foreach ($stories as $story): ?>
        <a class="card" href="<?= BASE_URL ?>/story.php?slug=<?= e($story['slug']) ?>">
          <strong><?= e($story['title']) ?></strong>
          <?php if ($story['excerpt']): ?><p class="text-muted"><?= e($story['excerpt']) ?></p><?php endif; ?>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<section class="section" style="background:var(--accent); color:#fff; text-align:center;">
  <h2 style="color:#fff;">Join the Community</h2>
  <p style="max-width:560px; margin:12px auto 0; opacity:.9;">Wherever we are in the world, we are connected by one name. Become a verified part of the global Subzwari network.</p>
  <p style="margin-top:24px;"><a class="btn" style="background:#fff; color:var(--accent);" href="<?= BASE_URL ?>/register.php">JOIN THE COMMUNITY</a></p>
</section>
<?php require __DIR__ . '/includes/footer.php'; ?>
