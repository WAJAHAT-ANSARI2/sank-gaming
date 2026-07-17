<?php
// ============================================
// DATABASE CONNECTION CONFIG
// XAMPP/WAMP defaults: host localhost, user root, password empty
// Edit these if your MySQL setup is different
// ============================================

define('DB_HOST', 'localhost');
define('DB_NAME', 'sank_gaming');
define('DB_USER', 'root');
define('DB_PASS', '');

function getDBConnection() {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        $conn->set_charset('utf8mb4');
        return $conn;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit;
    }
}
