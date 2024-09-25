<?php

ini_set('display_errors', 'Off');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// this api has a monthly credit limit. This is unlikely to be reached in normal use once page is finished, but can be reached if testing a lot.

$url='http://api.exchangeratesapi.io/v1/latest?access_key=c09c8a4eb723e8b483a8518e9e6f32e4&symbols=GBP,USD,EUR,' . $_REQUEST['currency'];
    
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
$output['data'] = array(
    'gbp' => $decode['rates']['GBP'],
    'usd' => $decode['rates']['USD'],
    'eur' => $decode['rates']['EUR'],
    'local' => $decode['rates'][$_REQUEST['currency']]
);

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>