<?php
require_once __DIR__ . '/includes/functions.php';

if (current_user()) {
    redirect('/dashboard/index.php');
}

$errors = [];
$old = ['first_name' => '', 'last_name' => '', 'email' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $old['first_name'] = trim($_POST['first_name'] ?? '');
    $old['last_name'] = trim($_POST['last_name'] ?? '');
    $old['email'] = strtolower(trim($_POST['email'] ?? ''));
    $password = $_POST['password'] ?? '';

    if ($old['first_name'] === '' || $old['last_name'] === '') {
        $errors[] = 'First and last name are required.';
    }
    if (!filter_var($old['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Enter a valid email address.';
    }
    if (strlen($password) < 10 || !preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
        $errors[] = 'Password must be at least 10 characters and include a letter and a number.';
    }

    if (empty($errors)) {
        $stmt = db()->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$old['email']]);
        if ($stmt->fetch()) {
            $errors[] = "We couldn't create your account with those details. Try signing in instead.";
        }
    }

    if (empty($errors)) {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        db()->beginTransaction();
        try {
            $stmt = db()->prepare('INSERT INTO users (email, password_hash, email_verified_at, created_at, updated_at) VALUES (?, ?, NOW(), NOW(), NOW())');
            $stmt->execute([$old['email'], $hash]);
            $userId = (int) db()->lastInsertId();

            $slug = unique_slug($old['first_name'] . '-' . $old['last_name']);
            $stmt = db()->prepare('INSERT INTO profiles (user_id, first_name, last_name, slug, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())');
            $stmt->execute([$userId, $old['first_name'], $old['last_name'], $slug]);

            db()->commit();
        } catch (Exception $e) {
            db()->rollBack();
            $errors[] = 'Something went wrong creating your account. Please try again.';
        }

        if (empty($errors)) {
            flash('success', 'Account created! Sign in to complete your profile.');
            redirect('/login.php');
        }
    }
}

$pageTitle = 'Join the Community';
require __DIR__ . '/includes/header.php';
?>
<div class="container-narrow" style="padding:64px 24px;">
  <h1 class="display">Join the community</h1>
  <p class="text-muted">SUBZWARI&rsquo;s ARE ONE. Create your account to get started.</p>

  <?php foreach ($errors as $error): ?>
    <div class="alert alert-error"><?= e($error) ?></div>
  <?php endforeach; ?>

  <form method="post" class="card" style="max-width:480px;">
    <?= csrf_field() ?>
    <div class="field-row">
      <div class="field">
        <label for="first_name">First name</label>
        <input type="text" id="first_name" name="first_name" value="<?= e($old['first_name']) ?>" required>
      </div>
      <div class="field">
        <label for="last_name">Last name</label>
        <input type="text" id="last_name" name="last_name" value="<?= e($old['last_name']) ?>" required>
      </div>
    </div>
    <div class="field">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" value="<?= e($old['email']) ?>" required>
    </div>
    <div class="field">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" minlength="10" required>
    </div>
    <button type="submit" class="btn btn-primary" style="width:100%;">Create account</button>
  </form>
  <p class="text-muted" style="margin-top:16px;">Already a member? <a href="<?= BASE_URL ?>/login.php">Sign in</a></p>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
