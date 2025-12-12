<?php
echo "<h1 style='color:green;'>PHP IS WORKING!</h1>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>Time: " . date('Y-m-d H:i:s') . "</p>";
echo "<hr><h2>Testing mail() Function to contact@satyamparivahan.com</h2>";

$to = 'contact@satyamparivahan.com';
$subject = 'Test Email from Website - Correct From';
$message = "PHP mail() test successful!\nTime: " . date('Y-m-d H:i:s') . "\n\nThis test uses matching From address for better delivery.";

$headers = "From: Satyam Parivahan <contact@satyamparivahan.com>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

if (mail($to, $subject, $message, $headers)) {
    echo "<p style='color:green;font-weight:bold;'>✓ Test email SENT successfully!</p>";
} else {
    echo "<p style='color:red;font-weight:bold;'>✗ mail() returned false (email may still arrive delayed)</p>";
}
echo "<p><strong>Check GoDaddy Webmail NOW:</strong> cPanel → Email Accounts → contact@satyamparivahan.com → Check Email (Inbox + Spam).</p>";
echo "<p>Refresh webmail multiple times — internal emails can take 5-15 minutes.</p>";
?>