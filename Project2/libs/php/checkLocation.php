<?php
$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

// SQL statement accepts parameters and so is prepared to avoid SQL injection.
$query = $conn->prepare("SELECT
             l.name AS locationName,
             COUNT(d.id) as departmentCount
             FROM
             location l LEFT JOIN 
             department d ON (d.locationID = l.id)
             WHERE l.id = ?");

$query->bind_param("i", $_REQUEST['id']);
$query->execute();
$result = $query->get_result();

if (!$result) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query failed";    
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output); 
    exit;
}

$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    array_push($data, $row);
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['data'] = $data;

mysqli_close($conn);

echo json_encode($output);