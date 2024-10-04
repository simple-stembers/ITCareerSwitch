<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);


$url='https://api.opencagedata.com/geocode/v1/json?q=' . $_REQUEST['country'] . '&countrycode=' . $_REQUEST['countryCode'] . '&key=c1ef36f7e5fa4af08f0da169c1d8ca30';
    
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);


$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);
	


$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = array();

if (isset($decode['results'][0]['annotations']['currency']['html_entity'])) {
    $output['data']['currencySymbol'] = $decode['results'][0]['annotations']['currency']['html_entity'];
}

if (isset($decode['results'][0]['geometry']['lat'])) {
    $output['data']['centerLat'] = $decode['results'][0]['geometry']['lat'];
}

if (isset($decode['results'][0]['geometry']['lng'])) {
    $output['data']['centerLng'] = $decode['results'][0]['geometry']['lng'];
}

if (isset($decode['results'][0]['annotations']['timezone']['short_name'])) {
    $output['data']['timezone'] = $decode['results'][0]['annotations']['timezone']['short_name'];
}

if (isset($decode['results'][0]['annotations']['roadinfo']['drive_on'])) {
    $output['data']['driveOn'] = $decode['results'][0]['annotations']['roadinfo']['drive_on'];
}
    

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>
