<?php
function render_directory_filters(array $countries, bool $showCategory = false, array $categories = []): void
{
    $q = e($_GET['q'] ?? '');
    $countryId = $_GET['country_id'] ?? '';
    $industry = e($_GET['industry'] ?? '');
    ?>
    <form method="get" class="card" style="display:flex; flex-wrap:wrap; gap:16px; align-items:flex-end;">
      <div class="field" style="flex:1; min-width:180px;">
        <label>Search</label>
        <input type="text" name="q" value="<?= $q ?>" placeholder="Name, profession, company…">
      </div>
      <div class="field" style="min-width:160px;">
        <label>Country</label>
        <select name="country_id">
          <option value="">All countries</option>
          <?php foreach ($countries as $c): ?>
            <option value="<?= $c['id'] ?>" <?= (string) $countryId === (string) $c['id'] ? 'selected' : '' ?>><?= e($c['name']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="field" style="min-width:160px;">
        <label>Industry</label>
        <input type="text" name="industry" value="<?= $industry ?>">
      </div>
      <?php if ($showCategory): ?>
        <div class="field" style="min-width:160px;">
          <label>Category</label>
          <select name="category_id">
            <option value="">All categories</option>
            <?php foreach ($categories as $cat): ?>
              <option value="<?= $cat['id'] ?>" <?= (string) ($_GET['category_id'] ?? '') === (string) $cat['id'] ? 'selected' : '' ?>><?= e($cat['name']) ?></option>
            <?php endforeach; ?>
          </select>
        </div>
      <?php endif; ?>
      <div class="checkbox-row">
        <input type="checkbox" name="open_to_networking" value="1" id="otn" <?= !empty($_GET['open_to_networking']) ? 'checked' : '' ?>>
        <label for="otn">Open to networking</label>
      </div>
      <div class="checkbox-row">
        <input type="checkbox" name="open_to_mentorship" value="1" id="otm" <?= !empty($_GET['open_to_mentorship']) ? 'checked' : '' ?>>
        <label for="otm">Open to mentorship</label>
      </div>
      <button type="submit" class="btn btn-primary btn-sm">Filter</button>
    </form>
    <?php
}
