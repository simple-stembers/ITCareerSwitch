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

// SQL statement accepts parameters and so is prepared to avoid SQL injection.
// $_REQUEST used for development / debugging. Remember to change to $_POST for production

$query = $conn->prepare('UPDATE personnel SET firstName = ?, lastName = ?, email = ?, departmentID = ?, jobTitle = ? WHERE id = ?');

$firstName = $_REQUEST['firstName'];
$lastName = $_REQUEST['lastName'];
$email = $_REQUEST['email'];
$departmentID = $_REQUEST['departmentID'];
$jobTitle = $_REQUEST['jobTitle'];
$employeeID = $_REQUEST['id'];

// Update the type definition string to match the number of bind variables
$query->bind_param("sssisi", $firstName, $lastName, $email, $departmentID, $jobTitle, $employeeID);

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

mysqli_close($conn);

echo json_encode($output);

?>