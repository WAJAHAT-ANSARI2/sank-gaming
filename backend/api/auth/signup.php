<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$phone = trim($data['phone'] ?? '');

if (!$name || !$email || !$password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name, email and password are required']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

$conn = getDBConnection();

// Check if email already exists
$stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    exit;
}
$stmt->close();

$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

$stmt = $conn->prepare('INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, "customer")');
$stmt->bind_param('ssss', $name, $email, $hashedPassword, $phone);

if ($stmt->execute()) {
    $userId = $stmt->insert_id;
    $token = generateJWT(['id' => $userId, 'name' => $name, 'email' => $email, 'role' => 'customer']);

    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully',
        'token' => $token,
        'user' => ['id' => $userId, 'name' => $name, 'email' => $email, 'role' => 'customer']
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to create account']);
}

$stmt->close();
$conn->close();
