<?php

$codes_json = file_get_contents("../resources/countryBorders.geo.json");

$decoded = json_decode($codes_json);

$features = $decoded->features;

$countries = [];

for($i=0;$i<sizeof($features);$i++){

    $feature = $features[$i];

    $name = $feature->properties->name;

    $iso_a2 = $feature->properties->iso_a2;

    $array = [$name, $iso_a2];

    array_push($countries, $array);

}

usort($countries, function($a, $b) {

    return strcasecmp($a[0], $b[0]);

});

 

header('Content-Type: application/json; charset=UTF-8');

 

echo json_encode($countries);

?>