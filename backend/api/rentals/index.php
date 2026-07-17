<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$conn = getDBConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $authUser = requireAuth();
    $stmt = $conn->prepare('
        SELECT r.*, c.title as cd_title, c.platform, c.image, c.game_type
        FROM rentals r
        JOIN cds c ON r.cd_id = c.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
    ');
    $stmt->bind_param('i', $authUser['id']);
    $stmt->execute();
    $result = $stmt->get_result();
    $rentals = [];
    while ($row = $result->fetch_assoc()) $rentals[] = $row;
    echo json_encode(['success' => true, 'rentals' => $rentals]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $authUser = requireAuth();
    $data = json_decode(file_get_contents('php://input'), true);

    $cdId          = intval($data['cd_id']          ?? 0);
    $startDate     = trim($data['start_date']        ?? '');
    $days          = intval($data['days']            ?? 0);
    $deliveryType  = trim($data['delivery_type']     ?? 'pickup');
    $paymentMethod = trim($data['payment_method']    ?? 'cash');
    $area          = trim($data['area']              ?? '');
    $city          = trim($data['city']              ?? '');
    $landmark      = trim($data['landmark']          ?? '');

    if (!$cdId || !$startDate || $days < 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'cd_id, start_date and days are required']);
        exit;
    }

    if ($startDate < date('Y-m-d')) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Start date cannot be in the past']);
        exit;
    }

    if (!in_array($deliveryType, ['delivery', 'pickup'])) $deliveryType = 'pickup';
    if (!in_array($paymentMethod, ['cash', 'jazzcash', 'easypaisa'])) $paymentMethod = 'cash';

    if ($deliveryType === 'delivery' && (!$area || !$city)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Area and city are required for delivery']);
        exit;
    }

    $endDate = date('Y-m-d', strtotime("$startDate +$days days") - 86400);

    // Get CD
    $cdStmt = $conn->prepare('SELECT * FROM cds WHERE id = ? AND is_active = 1');
    $cdStmt->bind_param('i', $cdId);
    $cdStmt->execute();
    $cdResult = $cdStmt->get_result();
    if ($cdResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Game not found']);
        exit;
    }
    $cd = $cdResult->fetch_assoc();

    $slot = 'none';

    if ($cd['game_type'] === 'digital') {
        $slot = trim($data['slot'] ?? '');
        if (!in_array($slot, ['primary', 'secondary'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Please choose Primary or Secondary slot for digital game']);
            exit;
        }
        // Check slot availability
        $slotStmt = $conn->prepare("
            SELECT COUNT(*) as taken FROM rentals
            WHERE cd_id = ? AND slot = ? AND status = 'booked'
            AND NOT (end_date < ? OR start_date > ?)
        ");
        $slotStmt->bind_param('isss', $cdId, $slot, $startDate, $endDate);
        $slotStmt->execute();
        $taken = $slotStmt->get_result()->fetch_assoc()['taken'];
        if ($taken > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => ucfirst($slot) . ' slot is already booked for these dates']);
            exit;
        }
    } else {
        // Disc availability
        $bookedStmt = $conn->prepare("
            SELECT COUNT(*) as booked FROM rentals
            WHERE cd_id = ? AND status = 'booked'
            AND NOT (end_date < ? OR start_date > ?)
        ");
        $bookedStmt->bind_param('iss', $cdId, $startDate, $endDate);
        $bookedStmt->execute();
        $booked = $bookedStmt->get_result()->fetch_assoc()['booked'];
        if ($booked >= $cd['total_copies']) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'No copies available for selected dates']);
            exit;
        }
    }

    $totalPrice = $days * $cd['price_per_day'];

    $stmt = $conn->prepare('
        INSERT INTO rentals (user_id, cd_id, start_date, end_date, days, price_per_day, total_price, delivery_type, slot, payment_method, payment_status, area, city, landmark, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "pending", ?, ?, ?, "booked")
    ');
    $stmt->bind_param('iissiddssssss',
        $authUser['id'], $cdId, $startDate, $endDate, $days,
        $cd['price_per_day'], $totalPrice,
        $deliveryType, $slot, $paymentMethod,
        $area, $city, $landmark
    );

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Booked successfully!',
            'rental'  => [
                'id'             => $stmt->insert_id,
                'cd_title'       => $cd['title'],
                'game_type'      => $cd['game_type'],
                'slot'           => $slot,
                'start_date'     => $startDate,
                'end_date'       => $endDate,
                'days'           => $days,
                'price_per_day'  => $cd['price_per_day'],
                'total_price'    => $totalPrice,
                'payment_method' => $paymentMethod,
                'payment_status' => 'pending',
                'delivery_type'  => $deliveryType
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create rental: ' . $conn->error]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
$conn->close();
