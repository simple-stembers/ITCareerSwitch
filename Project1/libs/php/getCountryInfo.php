<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$url = 'https://secure.geonames.org/countryInfo?country=' . $_REQUEST['country'] . '&username=stembers';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);

// This API returns XML rather than JSON, so I need to use simplexml_load_string to convert it to an easy array. The output at the end is still JSON
$decode = array(simplexml_load_string($result));

$output['data'] = array(
    'population' => isset($decode[0]->country->population) ? (int)$decode[0]->country->population : null,
    'capital' => isset($decode[0]->country->capital) ? (string)$decode[0]->country->capital : null,
    'currencyCode' => isset($decode[0]->country->currencyCode) ? (string)$decode[0]->country->currencyCode : null,
    'language' => isset($decode[0]->country->languages[0]) ? (string)$decode[0]->country->languages[0] : null,
    'area' => isset($decode[0]->country->areaInSqKm) ? (float)$decode[0]->country->areaInSqKm : null,
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