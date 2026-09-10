<?php
$activeNav = 'settings';
$requiredRoles = ['admin'];
require_once __DIR__ . '/../includes/functions.php';
require __DIR__ . '/../includes/admin_header.php';

$categories = ['general', 'brand', 'email', 'registration', 'verification', 'privacy', 'moderation', 'notifications', 'seo', 'community'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    if (isset($_POST['delete_category'], $_POST['delete_key'])) {
        db()->prepare('DELETE FROM site_settings WHERE category=? AND setting_key=?')->execute([$_POST['delete_category'], $_POST['delete_key']]);
    } else {
        $category = in_array($_POST['category'] ?? '', $categories, true) ? $_POST['category'] : 'general';
        $key = trim($_POST['setting_key'] ?? '');
        if ($key !== '') {
            db()->prepare('INSERT INTO site_settings (category, setting_key, setting_value, updated_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value), updated_at=NOW()')
                ->execute([$category, $key, $_POST['setting_value'] ?? '']);
            write_audit_log($__user['id'], 'setting.update', 'SiteSetting', null, ['category' => $category, 'key' => $key]);
        }
    }
    redirect('/admin/settings.php');
}

$heroTitle = get_setting('general', 'hero_title', 'SUBZWARI GLOBAL');
$heroSubtitle = get_setting('general', 'hero_subtitle', "SUBZWARI's ARE ONE");
$heroDescription = get_setting('general', 'hero_description', 'Connecting Subzwari families, professionals and communities across the world.');
?>
<h1 class="display">Settings</h1>

<div class="card" style="max-width:600px;">
  <h3>Homepage Hero</h3>
  <form method="post">
    <?= csrf_field() ?>
    <input type="hidden" name="category" value="general">
    <input type="hidden" name="setting_key" value="hero_title">
    <div class="field"><label>Hero title</label><input type="text" name="setting_value" value="<?= e($heroTitle) ?>"></div>
    <button type="submit" class="btn btn-primary btn-sm">Save</button>
  </form>
  <form method="post" style="margin-top:12px;">
    <?= csrf_field() ?>
    <input type="hidden" name="category" value="general">
    <input type="hidden" name="setting_key" value="hero_subtitle">
    <div class="field"><label>Hero subtitle</label><input type="text" name="setting_value" value="<?= e($heroSubtitle) ?>"></div>
    <button type="submit" class="btn btn-primary btn-sm">Save</button>
  </form>
  <form method="post" style="margin-top:12px;">
    <?= csrf_field() ?>
    <input type="hidden" name="category" value="general">
    <input type="hidden" name="setting_key" value="hero_description">
    <div class="field"><label>Hero description</label><textarea name="setting_value" rows="2"><?= e($heroDescription) ?></textarea></div>
    <button type="submit" class="btn btn-primary btn-sm">Save</button>
  </form>
</div>

<?php foreach ($categories as $category):
    $stmt = db()->prepare('SELECT * FROM site_settings WHERE category=? AND setting_key NOT IN ("hero_title","hero_subtitle","hero_description") ORDER BY setting_key ASC');
    $stmt->execute([$category]);
    $settings = $stmt->fetchAll();
?>
  <div class="card" style="max-width:600px;">
    <h3><?= e(ucfirst($category)) ?></h3>
    <?php foreach ($settings as $s): ?>
      <div style="display:flex; gap:8px; align-items:flex-end; margin-bottom:8px;">
        <form method="post" style="flex:1; display:flex; gap:8px; align-items:flex-end;">
          <?= csrf_field() ?>
          <input type="hidden" name="category" value="<?= e($category) ?>">
          <div class="field" style="flex:1; margin-bottom:0;"><label><?= e($s['setting_key']) ?></label><input type="text" name="setting_key" value="<?= e($s['setting_key']) ?>" readonly></div>
          <div class="field" style="flex:1; margin-bottom:0;"><label>Value</label><input type="text" name="setting_value" value="<?= e($s['setting_value']) ?>"></div>
          <button type="submit" class="btn btn-secondary btn-sm">Save</button>
        </form>
        <form method="post">
          <?= csrf_field() ?>
          <input type="hidden" name="delete_category" value="<?= e($category) ?>">
          <input type="hidden" name="delete_key" value="<?= e($s['setting_key']) ?>">
          <button type="submit" class="btn btn-danger btn-sm">Remove</button>
        </form>
      </div>
    <?php endforeach; ?>
    <form method="post" style="display:flex; gap:8px; align-items:flex-end; border-top:1px solid var(--border); padding-top:12px;">
      <?= csrf_field() ?>
      <input type="hidden" name="category" value="<?= e($category) ?>">
      <div class="field" style="margin-bottom:0;"><label>New key</label><input type="text" name="setting_key"></div>
      <div class="field" style="margin-bottom:0;"><label>Value</label><input type="text" name="setting_value"></div>
      <button type="submit" class="btn btn-primary btn-sm">Add setting</button>
    </form>
  </div>
<?php endforeach; ?>
<?php require __DIR__ . '/../includes/admin_footer.php'; ?>
