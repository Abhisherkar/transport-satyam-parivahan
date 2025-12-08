<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$to      = "contactsatyamparivahan@.com";
$subject = "PHP Mail Test";
$message = "This is a test to check the PHP mail() function.";
$headers = "From: test@" . $_SERVER['SERVER_NAME'];

if (mail($to, $subject, $message, $headers)) {
    echo "Test email sent.";
} else {
    echo "mail() failed.";
}
?>
