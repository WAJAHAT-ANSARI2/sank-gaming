<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$conn = getDBConnection();
$id = intval($_GET['id'] ?? 0);

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'CD id is required']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // ============================================
    // GET /api/cds/detail.php?id=1
    // Public - get single CD details + its booked date ranges (for availability calendar)
    // ============================================
    $stmt = $conn->prepare('SELECT * FROM cds WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'CD not found']);
        exit;
    }

    $cd = $result->fetch_assoc();

    // For digital games: show which slots are available upcoming
    if ($cd['game_type'] === 'digital') {
        $slotStmt = $conn->prepare(
            "SELECT slot, start_date, end_date FROM rentals WHERE cd_id = ? AND status = 'booked' AND end_date >= CURDATE()"
        );
        $slotStmt->bind_param('i', $id);
        $slotStmt->execute();
        $slotResult = $slotStmt->get_result();
        $bookedSlots = [];
        while ($row2 = $slotResult->fetch_assoc()) {
            $bookedSlots[] = $row2;
        }
        $cd['booked_slots'] = $bookedSlots;
        $cd['booked_ranges'] = [];
    } else {
        // Disc: get upcoming booked date ranges
        $bookingsStmt = $conn->prepare(
            "SELECT start_date, end_date FROM rentals WHERE cd_id = ? AND status = 'booked' AND end_date >= CURDATE()"
        );
        $bookingsStmt->bind_param('i', $id);
        $bookingsStmt->execute();
        $bookingsResult = $bookingsStmt->get_result();
        $bookedRanges = [];
        while ($row2 = $bookingsResult->fetch_assoc()) {
            $bookedRanges[] = $row2;
        }
        $cd['booked_ranges'] = $bookedRanges;
        $cd['booked_slots'] = [];
    }

    echo json_encode(['success' => true, 'cd' => $cd]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // ============================================
    // PUT /api/cds/detail.php?id=1
    // Admin only - update a CD
    // ============================================
    requireAdmin();

    $data = json_decode(file_get_contents('php://input'), true);

    $title = trim($data['title'] ?? '');
    $description = trim($data['description'] ?? '');
    $platform = trim($data['platform'] ?? '');
    $genre = trim($data['genre'] ?? '');
    $pricePerDay = $data['price_per_day'] ?? null;
    $totalCopies = $data['total_copies'] ?? 1;
    $image = trim($data['image'] ?? '');
    $isActive = isset($data['is_active']) ? intval($data['is_active']) : 1;

    if (!$title || !$pricePerDay) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Title and price per day are required']);
        exit;
    }

    $stmt = $conn->prepare('UPDATE cds SET title=?, description=?, platform=?, genre=?, price_per_day=?, total_copies=?, image=?, is_active=? WHERE id=?');
    $stmt->bind_param('ssssdisii', $title, $description, $platform, $genre, $pricePerDay, $totalCopies, $image, $isActive, $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'CD updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update CD']);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // ============================================
    // DELETE /api/cds/detail.php?id=1
    // Admin only - delete a CD
    // ============================================
    requireAdmin();

    $stmt = $conn->prepare('DELETE FROM cds WHERE id = ?');
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'CD deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete CD']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

$conn->close();
