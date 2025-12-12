<?php
/**
 * send-inquiry.php - FINAL VERSION (Dec 2025)
 * Clean, professional email format | No IP | No timestamp | Works on GoDaddy
 */

ob_start();

// Remove these lines after final testing
// ini_set('display_errors', 1);
// error_reporting(E_ALL);

date_default_timezone_set('Asia/Kolkata');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_end_clean();
    die("Invalid request method.");
}

// Form data
$action  = isset($_POST['action']) ? trim($_POST['action']) : 'email';
$name    = isset($_POST['name']) ? trim($_POST['name']) : '';
$company = isset($_POST['company']) ? trim($_POST['company']) : '';
$email   = isset($_POST['email']) ? trim($_POST['email']) : '';
$phone   = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$service = isset($_POST['service']) ? trim($_POST['service']) : 'Full Load';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// Validation
if (empty($name) || empty($email) || empty($phone)) {
    ob_end_clean();
    showError("Name, email, and phone are required.");
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    ob_end_clean();
    showError("Please enter a valid email address.");
}

// WhatsApp redirect
if ($action === 'whatsapp') {
    $waNumber = '917972699155';
    $text = "Inquiry%0A%0AName: " . urlencode($name) . "%0A";
    if (!empty($company)) $text .= "Company: " . urlencode($company) . "%0A";
    $text .= "Email: " . urlencode($email) . "%0A";
    $text .= "Phone: +91 " . urlencode($phone) . "%0A";
    $text .= "Service: " . urlencode($service) . "%0A%0A";
    if (!empty($message)) $text .= "Message:%0A" . urlencode($message) . "%0A";
    $text .= "%0A— Sent from Satyam Parivahan website";

    ob_end_clean();
    header("Location: https://wa.me/{$waNumber}?text={$text}");
    exit;
}

// Email sending (currently to Gmail — change to contact@ when ready)
if ($action === 'email') {
    $to = 'contact@satyamparivahan.com';  // ← Change to 'contact@satyamparivahan.com' when DNS is ready

    $subject = 'New Inquiry - ' . $name . (!empty($service) ? " ({$service})" : '');

    $body = "New inquiry submitted from Satyam Parivahan website:\n\n";
    $body .= "======================================\n";
    $body .= "CUSTOMER DETAILS\n";
    $body .= "======================================\n";
    $body .= "Name:            {$name}\n";
    if (!empty($company)) $body .= "Company:         {$company}\n";
    $body .= "Reply Email:     {$email}\n";
    $body .= "Phone:           +91 {$phone}\n";
    $body .= "Service:         {$service}\n";
    $body .= "======================================\n\n";
    $body .= "MESSAGE:\n";
    $body .= "{$message}\n\n";
    $body .= "======================================\n";
    $body .= "Thank you,\n";
    $body .= "Satyam Parivahan Team\n";
    $body .= "+91 79726 99155\n";
    $body .= "www.satyamparivahan.com\n";

    $headers  = "From: Satyam Parivahan <contact@satyamparivahan.com>\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    ob_end_clean();

    if (mail($to, $subject, $body, $headers)) {
        showSuccess();
    } else {
        showError("Email queued (may be delayed). Try WhatsApp or call 7972699155.");
    }
}

ob_end_clean();
showError("Invalid action.");

// ==================== SUCCESS PAGE ====================
function showSuccess() {
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Sent Successfully</title>
    <meta http-equiv="refresh" content="5;url=inquiry.html">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .box { background: white; padding: 50px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; max-width: 500px; animation: slideUp 0.5s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .icon { font-size: 80px; margin-bottom: 20px; animation: bounce 1s ease; }
        @keyframes bounce { 0%,20%,50%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-20px); } 60% { transform: translateY(-10px); } }
        h1 { color: #4CAF50; margin-bottom: 20px; font-size: 32px; }
        p { color: #555; margin-bottom: 15px; line-height: 1.6; font-size: 16px; }
        .contact { margin-top: 30px; padding-top: 30px; border-top: 2px solid #eee; }
        a { color: #667eea; text-decoration: none; font-weight: 700; }
        a:hover { text-decoration: underline; }
        .timer { margin-top: 20px; font-size: 14px; color: #999; }
    </style>
</head>
<body>
    <div class="box">
        <div class="icon">✓</div>
        <h1>Email Sent Successfully!</h1>
        <p><strong>Thank you for contacting Satyam Parivahan.</strong></p>
        <p>Your inquiry has been received and we will get back to you shortly.</p>
        <div class="contact">
            <p>Need immediate assistance?</p>
            <p>Call: <a href="tel:7972699155">7972699155</a><br>
               WhatsApp: <a href="https://wa.me/917972699155">7972699155</a></p>
        </div>
        <div class="timer">
            <p>Redirecting in 5 seconds...</p>
            <p><a href="inquiry.html">← Back to Inquiry Form</a></p>
        </div>
    </div>
</body>
</html>
<?php
    exit;
}

// ==================== ERROR PAGE ====================
function showError($errorMessage) {
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .box { background: white; padding: 50px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; max-width: 500px; }
        .icon { font-size: 80px; margin-bottom: 20px; }
        h1 { color: #f44336; margin-bottom: 20px; font-size: 32px; }
        .error-box { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0; color: #856404; font-weight: 600; }
        p { color: #555; margin-bottom: 15px; line-height: 1.6; }
        a { display: inline-block; margin-top: 25px; padding: 15px 40px; background: #667eea; color: white; border-radius: 8px; text-decoration: none; font-weight: 700; }
        a:hover { background: #5568d3; transform: translateY(-2px); }
    </style>
</head>
<body>
    <div class="box">
        <div class="icon">✗</div>
        <h1>Oops! Something went wrong</h1>
        <div class="error-box"><?php echo htmlspecialchars($errorMessage, ENT_QUOTES, 'UTF-8'); ?></div>
        <p>Please try again or contact us directly:</p>
        <p><strong>7972699155</strong><br><strong>contact@satyamparivahan.com</strong></p>
        <a href="inquiry.html">← Back to Inquiry Form</a>
    </div>
</body>
</html>
<?php
    exit;
}
?>