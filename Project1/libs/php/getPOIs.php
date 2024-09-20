<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);


$url='https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:' . $_REQUEST['lng'] . ',' . $_REQUEST['lat'] . ',50000&&limit=20&apiKey=aae1b173110a425c879d739d074a31c5';
    
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);


$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);
	


$output['data'] = array();

foreach ($decode['features'] as $attraction) {
    $output['data'][] = array(
        'name' => $attraction['properties']['name'],
        'website' => isset($attraction['properties']['website']) ? $attraction['properties']['website'] : 'No website listed',
        'openingHours' => isset($attraction['properties']['opening_hours']) ? $attraction['properties']['opening_hours'] : 'No opening hours listed',
        'address' => $attraction['properties']['formatted'],
        'lat' => $attraction['properties']['lat'],
        'lng' => $attraction['properties']['lon']
    );
};
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";


header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>
