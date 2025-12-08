<?php
// send-inquiry.php
ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: inquiry.html');
    exit;
}

// Which button was clicked?
$action = isset($_POST['action']) ? $_POST['action'] : 'email';

// Common fields
$name    = isset($_POST['name'])    ? trim($_POST['name'])    : '';
$company = isset($_POST['company']) ? trim($_POST['company']) : '';
$email   = isset($_POST['email'])   ? trim($_POST['email'])   : '';
$phone   = isset($_POST['phone'])   ? trim($_POST['phone'])   : '';
$service = isset($_POST['service']) ? trim($_POST['service']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// Basic validation for both paths
if ($name === '' || $phone === '') {
    header('Location: inquiry.html?status=error');
    exit;
}

// 1) EMAIL PATH
if ($action === 'email') {

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header('Location: inquiry.html?status=error');
        exit;
    }

    $to      = "satyamparivahan@gmail.com";
    $subject = "New Inquiry - Satyam Parivahan";

    $body  = "New inquiry from website:\n\n";
    $body .= "Name: $name\n";
    $body .= "Company: $company\n";
    $body .= "Email: $email\n";
    $body .= "Phone: +91 $phone\n";
    $body .= "Service Type: $service\n";
    $body .= "Message:\n$message\n";

    $from    = "contact@satyamparivahan.com"; // must be valid mailbox on your server
    $headers = "From: ".$from."\r\n";
    $headers .= "Reply-To: ".$email."\r\n";

    if (mail($to, $subject, $body, $headers)) {
        // back to same page with success flag
        header('Location: inquiry.html?status=success');
        exit;
    } else {
        header('Location: inquiry.html?status=error');
        exit;
    }
}

// 2) WHATSAPP PATH
if ($action === 'whatsapp') {
    // Build WhatsApp message
    $waMessage  = "New inquiry from website:%0A%0A";
    $waMessage .= "Name: " . urlencode($name) . "%0A";
    if ($company !== '') {
        $waMessage .= "Company: " . urlencode($company) . "%0A";
    }
    $waMessage .= "Phone: +91 " . urlencode($phone) . "%0A";
    if ($email !== '') {
        $waMessage .= "Email: " . urlencode($email) . "%0A";
    }
    $waMessage .= "Service Type: " . urlencode($service) . "%0A";
    if ($message !== '') {
        $waMessage .= "Message: " . urlencode($message) . "%0A";
    }

    // Your WhatsApp number
    $waNumber = "917972699155"; // 91 + 7972699155

    $waUrl = "https://wa.me/$waNumber?text=$waMessage";

    header("Location: $waUrl");
    exit;
}

// Fallback
header('Location: inquiry.html');
exit;
