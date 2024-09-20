<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);
$accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIyYTBkNTZiOGNlMmIyMmM3NzU0MmFmNTEyMWZlNjlmMCIsImp0aSI6ImNkNDM0ZWM5ZjdjZjcwZmI1YmI2MGY2MTUwZWY1OGM5MDllYzdiYTJhOTVkNzFmOGZiMjhhMmQ1MmM2MDM0M2NhZTg0MmE0NzE5ODAzODUyIiwiaWF0IjoxNzI2ODUxMDM2LjU4Mzg0MywibmJmIjoxNzI2ODUxMDM2LjU4Mzg0OCwiZXhwIjozMzI4Mzc1OTgzNi41ODEyODcsInN1YiI6Ijc2NTQyNzI4IiwiaXNzIjoiaHR0cHM6Ly9tZXRhLndpa2ltZWRpYS5vcmciLCJyYXRlbGltaXQiOnsicmVxdWVzdHNfcGVyX3VuaXQiOjUwMDAsInVuaXQiOiJIT1VSIn0sInNjb3BlcyI6WyJiYXNpYyJdfQ.cazsvWS2-02L7xwYGeExmdfyJn87vF0uOtng2p5YY6ZDX7dD4Xt8y9G6TPyy0jiwe1E-THdqtvlR0PyYtyWDCcn3vAeE04qysaQfmDCFwTiR3DEuPf1dwmVV7gWjuM5FrBAkweZ8F0wcbrG5Fjf-3I2eOpPLoKFNvxOPQCvYtdoJYE6lnoaTm1LuivvyT2WAEuiIDhsEdKykvgfw3Xo8RCBQ54WHXTBo9yDrYGkAtuf6Lwtxhp7i3YfOzD5NH5BekxonidvviGuzPXMIKwmCzTfScssUB_bPH1x1YMgvFITLImJHv2ADv3rXn_gOLYIAZCdG0XJNFCAdaM6lZSKB62tfIfQBFBLbJEpqyvZOwW9v9LT7z13nqrD1b2bsyBKWaSi-vM7Rvc64eQ78rir0jVakEPBuYGHt016N_FhPIGcXsS8B4zZRajlP6ByDzncoU79c6ZB3NUB3ZLR5K54khpcG7B7RgIfVRBLjVsxUwAl_oh9PMY22jH2qJIQT7j-D6M-3yKzFH4SwJ-FovzUjS4LqLEiRH2s9h5aopR-BFMVENJdY4RZQmZIf4Hn4IjUMGeBy36tLwo3xRDUk9c2c2Pxay3akgb9sRE1Tn7TAtCH1F2VTe3WM2rOAAecjnj4-G1ykOJ3bEkO2yLCsYYfQLBNzzfycexrtTA7Lb12bmmg'  ;
$executionStartTime = microtime(true);


$url='https://api.wikimedia.org/core/v1/wikipedia/en/page/' . $_REQUEST['country'] . '/bare';
    
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Authorization: Bearer ' . $accessToken
    )
);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);
	

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $decode;
header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>
