<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);


$url='https://secure.geonames.org/countryInfo?country=' . $_REQUEST['country'] . '&username=stembers';
    
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);


$result=curl_exec($ch);

curl_close($ch);
//this api returns xml rather than json, so I need to use simplexml_load_string to convert it to an easy array. The output at the end is still json
$decode = array(simplexml_load_string($result));
	

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = array(
    'population' => (int)$decode[0]->country->population,
    'capital' => (string)$decode[0]->country->capital,
    'currencyCode' => (string)$decode[0]->country->currencyCode,
    'language' => (string)$decode[0]->country->languages[0]
);

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>
