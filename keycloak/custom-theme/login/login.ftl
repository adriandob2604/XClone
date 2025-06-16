<!DOCTYPE html>
<html lang="en">
<head>
    <title>Custom Login</title>
    <link rel="stylesheet" href="${url.resourcesPath}/css/custom-login.css">
</head>
<body>
    <div class="login-container">
        <h1>Log in</h1>
        <form action="${url.loginAction}" method="post">
            <input type="text" name="username" autoComplete="off" placeholder="Username" required>
            <input type="password" name="password" autoComplete="off" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    </div>
</body>
</html>