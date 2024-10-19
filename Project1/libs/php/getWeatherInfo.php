<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);


$url='https://api.weatherapi.com/v1/forecast.json?key=e687016bb7ba4279a82145757241710&q=' . $_REQUEST['city'] . '&days=3&aqi=no&alerts=no';
    
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);


$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);	

$currentWeather = [
    'date' => isset($decode['location']['localtime']) ? $decode['location']['localtime'] : null,
    'maxtemp' => isset($decode['current']['temp_c']) ? $decode['current']['temp_c'] : null,
    'feelslike' => isset($decode['current']['feelslike_c']) ? $decode['current']['feelslike_c'] : null,
    'conditions' => isset($decode['current']['condition']['text']) ? $decode['current']['condition']['text'] : null,
    'condition_icon' => isset($decode['current']['condition']['icon']) ? $decode['current']['condition']['icon'] : null,
    'condition_code' => isset($decode['current']['condition']['code']) ? $decode['current']['condition']['code'] : null,
    'chance_of_rain' => isset($decode['forecast']['forecastday'][0]['day']['daily_chance_of_rain']) ? $decode['forecast']['forecastday'][0]['day']['daily_chance_of_rain'] : null
];

$forecast = [];
foreach ($decode['forecast']['forecastday'] as $day) {
    $forecast[] = [
        'date' => isset($day['date']) ? $day['date'] : null,
        'maxtemp' => isset($day['day']['maxtemp_c']) ? $day['day']['maxtemp_c'] : null,
        'mintemp' => isset($day['day']['mintemp_c']) ? $day['day']['mintemp_c'] : null,
        'conditions' => isset($day['day']['condition']['text']) ? $day['day']['condition']['text'] : null,
        'condition_icon' => isset($day['day']['condition']['icon']) ? $day['day']['condition']['icon'] : null,
        'condition_code' => isset($day['day']['condition']['code']) ? $day['day']['condition']['code'] : null,
        'chance_of_rain' => isset($day['day']['daily_chance_of_rain']) ? $day['day']['daily_chance_of_rain'] : null
    ];
}

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

// Check for null values in $currentWeather and $forecast
if (hasNullValues($currentWeather) || hasNullValues($forecast)) {
    $output['status']['code'] = "500";
    $output['status']['name'] = "error";
    $output['status']['description'] = "Data contains null values";
} else {
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
}
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = [
    'current' => $currentWeather,
    'forecast' => $forecast,
    'lastUpdate' => $decode['current']['last_updated']
];
	
header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>
