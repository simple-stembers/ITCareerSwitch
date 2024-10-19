<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$url = 'http://api.geonames.org/searchJSON?country=' . $_REQUEST['country'] . '&maxRows=10&username=stembers';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);

$decode = json_decode($result, true);

$cities = [];

foreach ($decode['geonames'] as $city) {
    $cities[] = [
        'name' => isset($city['name']) ? $city['name'] : null,
        'lat' => isset($city['lat']) ? $city['lat'] : null,
        'lng' => isset($city['lng']) ? $city['lng'] : null
    ];
}

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

// Check for null values in $cities
if (hasNullValues($cities)) {
    $output['status']['code'] = "500";
    $output['status']['name'] = "error";
    $output['status']['description'] = "Data contains null values";
} else {
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
}

$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $cities;

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);

?>