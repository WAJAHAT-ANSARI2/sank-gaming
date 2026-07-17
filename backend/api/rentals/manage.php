<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$conn = getDBConnection();
$id   = intval($_GET['id'] ?? 0);

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Rental id required']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $authUser = requireAuth();
    if ($authUser['role'] === 'admin') {
        $stmt = $conn->prepare("UPDATE rentals SET status = 'cancelled' WHERE id = ?");
        $stmt->bind_param('i', $id);
    } else {
        $stmt = $conn->prepare("UPDATE rentals SET status = 'cancelled' WHERE id = ? AND user_id = ? AND status = 'booked'");
        $stmt->bind_param('ii', $id, $authUser['id']);
    }
    if ($stmt->execute() && $stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Rental cancelled']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Rental not found or cannot be cancelled']);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    requireAdmin();
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['status'])) {
        if (!in_array($data['status'], ['booked', 'returned', 'cancelled'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid status']);
            exit;
        }
        $stmt = $conn->prepare('UPDATE rentals SET status = ? WHERE id = ?');
        $stmt->bind_param('si', $data['status'], $id);
        $stmt->execute();
    }

    if (isset($data['payment_status'])) {
        if (!in_array($data['payment_status'], ['pending', 'paid'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid payment status']);
            exit;
        }
        $stmt = $conn->prepare('UPDATE rentals SET payment_status = ? WHERE id = ?');
        $stmt->bind_param('si', $data['payment_status'], $id);
        $stmt->execute();
    }

    echo json_encode(['success' => true, 'message' => 'Rental updated']);
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
$conn->close();
