<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$authUser = requireAuth();

$conn = getDBConnection();
$stmt = $conn->prepare('SELECT id, name, email, role, phone FROM users WHERE id = ?');
$stmt->bind_param('i', $authUser['id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

echo json_encode(['success' => true, 'user' => $result->fetch_assoc()]);

$stmt->close();
$conn->close();
