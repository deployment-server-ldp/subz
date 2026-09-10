<?php
require_once __DIR__ . '/includes/functions.php';

if (current_user()) {
    redirect('/dashboard/index.php');
}

$errors = [];
$email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $email = strtolower(trim($_POST['email'] ?? ''));
    $password = $_POST['password'] ?? '';

    $stmt = db()->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        $errors[] = 'Incorrect email or password.';
    } elseif ($user['account_status'] !== 'active') {
        $errors[] = 'Your account is not active. Contact support for help.';
    } else {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        redirect('/dashboard/index.php');
    }
}

$pageTitle = 'Sign In';
require __DIR__ . '/includes/header.php';
?>
<div class="container-narrow" style="padding:64px 24px;">
  <h1 class="display">Sign in</h1>

  <?php foreach ($errors as $error): ?>
    <div class="alert alert-error"><?= e($error) ?></div>
  <?php endforeach; ?>

  <form method="post" class="card" style="max-width:420px;">
    <?= csrf_field() ?>
    <div class="field">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" value="<?= e($email) ?>" required>
    </div>
    <div class="field">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" required>
    </div>
    <button type="submit" class="btn btn-primary" style="width:100%;">Sign in</button>
  </form>
  <p class="text-muted" style="margin-top:16px;">New to SUBZWARI Global? <a href="<?= BASE_URL ?>/register.php">Join the community</a></p>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
