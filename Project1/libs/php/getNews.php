<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$url = 'https://api.thenewsapi.com/v1/news/top?locale=' . $_REQUEST['countryCode'] . '&language=en&api_token=M3mMp7pLITgaUqy8OVqEiZT2XUyc1qbNgsfRrD7z';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);

$decode = json_decode($result, true);

$output['data'] = array_map(function ($story) {
    return array(
        'title' => isset($story['title']) ? $story['title'] : null,
        'description' => isset($story['description']) ? $story['description'] : null,
        'image_url' => isset($story['image_url']) ? $story['image_url'] : null,
        'url' => isset($story['url']) ? $story['url'] : null,
        'source' => isset($story['source']) ? $story['source'] : null
    );
}, $decode['data']);

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