<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);


$url='https://api.thenewsapi.com/v1/news/top?locale=' . $_REQUEST['countryCode'] . '&language=en&api_token=M3mMp7pLITgaUqy8OVqEiZT2XUyc1qbNgsfRrD7z';
    
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
$output['data'] = array_map(function ($story) {
    return array(
        'title' => $story['title'],
        'description' => $story['description'],
        'image_url' => $story['image_url'],
        'url' => $story['url'],
        'source' => $story['source']
    );
}, $decode['data']);
header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>
