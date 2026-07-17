<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$conn = getDBConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Public — get current banner video
    $result = $conn->query("SELECT * FROM banner_video ORDER BY id DESC LIMIT 1");
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $row['url'] = 'http://localhost/backend/uploads/videos/' . $row['filename'];
        echo json_encode(['success' => true, 'video' => $row]);
    } else {
        echo json_encode(['success' => true, 'video' => null]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Admin only — upload video
    requireAdmin();

    if (!isset($_FILES['video']) || $_FILES['video']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No video file uploaded']);
        exit;
    }

    $file = $_FILES['video'];
    $ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($ext, ['mp4', 'webm', 'ogg'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Only mp4, webm, ogg allowed']);
        exit;
    }

    // Make sure uploads/videos folder exists
    $uploadDir = __DIR__ . '/../../uploads/videos/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $filename = 'banner_' . time() . '.' . $ext;
    $dest     = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to save video file']);
        exit;
    }

    // Delete old video
    $old = $conn->query("SELECT filename FROM banner_video ORDER BY id DESC LIMIT 1");
    if ($old && $old->num_rows > 0) {
        $oldFile = $old->fetch_assoc()['filename'];
        $oldPath = $uploadDir . $oldFile;
        if (file_exists($oldPath)) unlink($oldPath);
        $conn->query("DELETE FROM banner_video");
    }

    $stmt = $conn->prepare("INSERT INTO banner_video (filename, original_name) VALUES (?, ?)");
    $stmt->bind_param('ss', $filename, $file['name']);
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Video uploaded successfully!',
        'url'     => 'http://localhost/backend/uploads/videos/' . $filename
    ]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    requireAdmin();

    $old = $conn->query("SELECT filename FROM banner_video ORDER BY id DESC LIMIT 1");
    if ($old && $old->num_rows > 0) {
        $oldFile = $old->fetch_assoc()['filename'];
        $oldPath = __DIR__ . '/../../uploads/videos/' . $oldFile;
        if (file_exists($oldPath)) unlink($oldPath);
        $conn->query("DELETE FROM banner_video");
    }
    echo json_encode(['success' => true, 'message' => 'Video deleted']);

} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

$conn->close();
