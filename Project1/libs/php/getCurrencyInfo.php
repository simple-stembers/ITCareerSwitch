<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// this api has a monthly credit limit. This is unlikely to be reached in normal use once page is finished, but can be reached if testing a lot.

$url = 'https://openexchangerates.org/api/latest.json?app_id=c68570b2f9704ccbae9f9a7ebb50909e';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);

$decode = json_decode($result, true);

$output['data'] = array(
    'gbp' => isset($decode['rates']['GBP']) ? $decode['rates']['GBP'] : null,
    'usd' => isset($decode['rates']['USD']) ? $decode['rates']['USD'] : null,
    'local' => isset($decode['rates'][$_REQUEST['currency']]) ? $decode['rates'][$_REQUEST['currency']] : null
);

// Function to check for null values in an array
function hasNullValues($array) {
    foreach ($array as $value) {
        if (is_array($value)) {
            if (hasNullValues($value)) {
                return true;
            }
        } elseif (is_null($value)) {
            return true;
        }
    }
    return false;
}

// Check for null values in $output['data']
if (hasNullValues($output['data'])) {
    $output['status']['code'] = "500";
    $output['status']['name'] = "error";
    $output['status']['description'] = "Data contains null values";
} else {
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
}

$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);

?>