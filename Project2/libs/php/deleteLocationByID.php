<?php

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$executionStartTime = microtime(true);

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

// Check if there are departments assigned to the location
$checkQuery = $conn->prepare('SELECT COUNT(id) as departmentCount FROM department WHERE locationID = ?');
$checkQuery->bind_param("i", $_REQUEST['id']);
$checkQuery->execute();
$checkQuery->bind_result($departmentCount);
$checkQuery->fetch();
$checkQuery->close();

if ($departmentCount > 0) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "Cannot delete location. There are departments assigned to this location.";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

// SQL statement accepts parameters and so is prepared to avoid SQL injection.
// $_REQUEST used for development / debugging. Remember to change to $_POST for production

$query = $conn->prepare('DELETE FROM location WHERE id = ?');
$query->bind_param("i", $_REQUEST['id']);
$query->execute();

if ($query->error) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query failed";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = [];

mysqli_close($conn);

echo json_encode($output);

?>