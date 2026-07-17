<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

requireAdmin();
$conn = getDBConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $type = $_GET['type'] ?? 'rentals';

    if ($type === 'stats') {
        // Dashboard stats
        $stats = [];

        $r = $conn->query("SELECT COUNT(*) as total FROM rentals WHERE status = 'booked'")->fetch_assoc();
        $stats['active_rentals'] = $r['total'];

        $r = $conn->query("SELECT COUNT(*) as total FROM cds WHERE is_active = 1")->fetch_assoc();
        $stats['total_cds'] = $r['total'];

        $r = $conn->query("SELECT COUNT(*) as total FROM users WHERE role = 'customer'")->fetch_assoc();
        $stats['total_customers'] = $r['total'];

        $r = $conn->query("SELECT SUM(total_price) as revenue FROM rentals WHERE status != 'cancelled'")->fetch_assoc();
        $stats['total_revenue'] = $r['revenue'] ?? 0;

        echo json_encode(['success' => true, 'stats' => $stats]);

    } elseif ($type === 'rentals') {
        // All rentals with customer and CD info
        $status = $_GET['status'] ?? '';
        $query = '
            SELECT r.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
                   c.title as cd_title, c.platform
            FROM rentals r
            JOIN users u ON r.user_id = u.id
            JOIN cds c ON r.cd_id = c.id
        ';
        if ($status) {
            $query .= " WHERE r.status = '" . $conn->real_escape_string($status) . "'";
        }
        $query .= ' ORDER BY r.created_at DESC';

        $result = $conn->query($query);
        $rentals = [];
        while ($row = $result->fetch_assoc()) {
            $rentals[] = $row;
        }
        echo json_encode(['success' => true, 'rentals' => $rentals]);

    } elseif ($type === 'calendar') {
        // Calendar data: all booked rentals for a given month
        $month = $_GET['month'] ?? date('Y-m');
        $startOfMonth = $month . '-01';
        $endOfMonth = date('Y-m-t', strtotime($startOfMonth));

        $stmt = $conn->prepare("
            SELECT r.id, r.start_date, r.end_date, r.status, r.total_price,
                   r.delivery_type, r.area, r.city, r.landmark,
                   u.name as customer_name,
                   c.title as cd_title, c.platform
            FROM rentals r
            JOIN users u ON r.user_id = u.id
            JOIN cds c ON r.cd_id = c.id
            WHERE r.status = 'booked'
              AND NOT (r.end_date < ? OR r.start_date > ?)
            ORDER BY r.start_date ASC
        ");
        $stmt->bind_param('ss', $startOfMonth, $endOfMonth);
        $stmt->execute();
        $result = $stmt->get_result();

        $events = [];
        while ($row = $result->fetch_assoc()) {
            $events[] = $row;
        }
        echo json_encode(['success' => true, 'events' => $events]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

$conn->close();
