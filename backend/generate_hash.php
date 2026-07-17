<?php
// Run this once via browser or CLI to generate a working hash, then copy the SQL output
// and run it in phpMyAdmin's SQL tab.

$password = 'Admin@123';
$hash = password_hash($password, PASSWORD_BCRYPT);

echo "Fresh hash for 'Admin@123':\n";
echo $hash . "\n\n";

echo "Run this SQL in phpMyAdmin to fix your admin login:\n\n";
echo "UPDATE users SET password = '$hash' WHERE email = 'admin@sankgaming.com';\n";
