<?php

header('Content-Type: application/json; charset=UTF-8');

$countryCode = $_REQUEST['countryCode'];

if (!$countryCode) {
    echo json_encode(['status' => 'error', 'message' => 'ISO code is required']);
    exit;
}

$codes_json = file_get_contents("../resources/countryBorders.geo.json");
$decoded = json_decode($codes_json, true);

$countryBorders = null;

foreach ($decoded['features'] as $feature) {
    if ($feature['properties']['iso_a2'] === strtoupper($countryCode)) {
        $countryBorders = $feature;
        break;
    }
}

if ($countryBorders) {
    echo json_encode(['status' => 'success', 'data' => $countryBorders]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Country not found']);
}

?>