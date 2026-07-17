<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../PHPMailer/PHPMailer.php';
require_once __DIR__ . '/../PHPMailer/SMTP.php';
require_once __DIR__ . '/../PHPMailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$data    = json_decode(file_get_contents('php://input'), true);
$name    = trim($data['name']    ?? '');
$email   = trim($data['email']   ?? '');
$phone   = trim($data['phone']   ?? '');
$message = trim($data['message'] ?? '');

if (!$name || !$email || !$message) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name, email and message are required']);
    exit;
}

$mail = new PHPMailer(true);

try {
    // Gmail SMTP settings
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'sankgaming5384@gmail.com';
    $mail->Password   = 'yzpujzizxmzgasbj'; // App password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom('sankgaming5384@gmail.com', 'SANK GAMING');
    $mail->addAddress('sankgaming5384@gmail.com'); // messages yahan aayenge
    $mail->addReplyTo($email, $name);

    $mail->Subject = "New Message from SANK GAMING Website - $name";
    $mail->Body    =
        "Naam: $name\n" .
        "Email: $email\n" .
        "Phone: $phone\n\n" .
        "Message:\n$message";

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Message sent successfully!']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send: ' . $mail->ErrorInfo]);
}
