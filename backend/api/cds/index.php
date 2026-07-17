<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$conn = getDBConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $search   = trim($_GET['search']   ?? '');
    $platform = trim($_GET['platform'] ?? '');
    $genre    = trim($_GET['genre']    ?? '');
    $type     = trim($_GET['game_type'] ?? ''); // disc | digital | ''

    $query  = 'SELECT id, title, game_type, description, platform, genre, price_per_day, total_copies, image, is_active FROM cds WHERE is_active = 1';
    $params = [];
    $types  = '';

    if ($search !== '') {
        $query .= ' AND title LIKE ?';
        $params[] = "%$search%";
        $types .= 's';
    }
    if ($platform !== '') {
        $query .= ' AND platform = ?';
        $params[] = $platform;
        $types .= 's';
    }
    if ($genre !== '') {
        $query .= ' AND genre = ?';
        $params[] = $genre;
        $types .= 's';
    }
    if ($type !== '') {
        $query .= ' AND game_type = ?';
        $params[] = $type;
        $types .= 's';
    }

    $query .= ' ORDER BY created_at DESC';

    $stmt = $conn->prepare($query);
    if ($params) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $today = date('Y-m-d');
    $cds = [];

    while ($row = $result->fetch_assoc()) {
        if ($row['game_type'] === 'digital') {
            // Digital: max 2 rentals at once (primary + secondary)
            // Check which slots are booked today
            $slotStmt = $conn->prepare(
                "SELECT slot FROM rentals WHERE cd_id = ? AND status = 'booked' AND ? BETWEEN start_date AND end_date"
            );
            $slotStmt->bind_param('is', $row['id'], $today);
            $slotStmt->execute();
            $slotResult = $slotStmt->get_result();
            $takenSlots = [];
            while ($s = $slotResult->fetch_assoc()) {
                $takenSlots[] = $s['slot'];
            }
            $row['available_slots'] = [];
            if (!in_array('primary', $takenSlots))   $row['available_slots'][] = 'primary';
            if (!in_array('secondary', $takenSlots)) $row['available_slots'][] = 'secondary';
            $row['available_now'] = count($row['available_slots']);
        } else {
            // Disc: uses total_copies logic
            $bookedStmt = $conn->prepare(
                "SELECT COUNT(*) as booked FROM rentals WHERE cd_id = ? AND status = 'booked' AND ? BETWEEN start_date AND end_date"
            );
            $bookedStmt->bind_param('is', $row['id'], $today);
            $bookedStmt->execute();
            $bookedCount = $bookedStmt->get_result()->fetch_assoc()['booked'];
            $row['available_now'] = max(0, $row['total_copies'] - $bookedCount);
            $row['available_slots'] = [];
        }
        $cds[] = $row;
    }

    echo json_encode(['success' => true, 'cds' => $cds]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAdmin();

    $data        = json_decode(file_get_contents('php://input'), true);
    $title       = trim($data['title']       ?? '');
    $gameType    = trim($data['game_type']   ?? 'disc'); // disc | digital
    $description = trim($data['description'] ?? '');
    $platform    = trim($data['platform']    ?? '');
    $genre       = trim($data['genre']       ?? '');
    $pricePerDay = $data['price_per_day']    ?? null;
    $totalCopies = $data['total_copies']     ?? 1;
    $image       = trim($data['image']       ?? '');

    if (!$title || !$pricePerDay) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Title and price per day are required']);
        exit;
    }

    if (!in_array($gameType, ['disc', 'digital'])) $gameType = 'disc';

    // Digital games always have 1 "copy" (2 slots handled via slot column)
    if ($gameType === 'digital') $totalCopies = 1;

    $stmt = $conn->prepare('INSERT INTO cds (title, game_type, description, platform, genre, price_per_day, total_copies, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('sssssdis', $title, $gameType, $description, $platform, $genre, $pricePerDay, $totalCopies, $image);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Game added successfully', 'id' => $stmt->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to add game: ' . $conn->error]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

$conn->close();
