<?php
// Footer links come from the `pages`/site content the admin manages via
// /admin/cms-pages.php in spirit; for simplicity this footer is static —
// wire it to a `footer_items` table the same way as settings.php if you
// want it admin-editable later (see php/README.md).
?>
</main>
<footer class="site-footer">
  <div class="footer-grid">
    <div>
      <div class="brand"><?= e(SITE_NAME) ?></div>
      <p class="text-muted"><?= e(SITE_TAGLINE) ?></p>
    </div>
    <div>
      <strong>Community</strong>
      <p><a href="<?= BASE_URL ?>/about.php">About</a></p>
      <p><a href="<?= BASE_URL ?>/history.php">History</a></p>
      <p><a href="<?= BASE_URL ?>/community-guidelines.php">Community Guidelines</a></p>
      <p><a href="<?= BASE_URL ?>/verification-info.php">Verification</a></p>
    </div>
    <div>
      <strong>Directory</strong>
      <p><a href="<?= BASE_URL ?>/members.php">Members</a></p>
      <p><a href="<?= BASE_URL ?>/professionals.php">Professionals</a></p>
      <p><a href="<?= BASE_URL ?>/businesses.php">Businesses</a></p>
      <p><a href="<?= BASE_URL ?>/countries.php">Countries</a></p>
    </div>
    <div>
      <strong>Legal</strong>
      <p><a href="<?= BASE_URL ?>/privacy.php">Privacy Policy</a></p>
      <p><a href="<?= BASE_URL ?>/terms.php">Terms of Service</a></p>
      <p><a href="<?= BASE_URL ?>/contact.php">Contact</a></p>
    </div>
  </div>
  <p class="footer-bottom">&copy; <?= date('Y') ?> <?= e(SITE_NAME) ?>. One Name. One Community. One Network.</p>
</footer>
<script src="<?= BASE_URL ?>/assets/js/main.js"></script>
</body>
</html>
