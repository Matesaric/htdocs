<?php
require 'validate.php';

// Datenbankverbindung
$mysqli = new mysqli("localhost", "root", "", "Kursverwaltung");
if($mysqli->connect_error) die(json_encode(["error"=>"DB-Verbindung fehlgeschlagen: ".$mysqli->connect_error]));

// GET Record
function getRecord($table, $idCol, $id) {
    global $mysqli;
    $stmt = $mysqli->prepare("SELECT * FROM `$table` WHERE `$idCol`=?");
    if(!$stmt) return ["error"=>$mysqli->error];
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();
    return $row ?: null;
}

// DELETE Record
function deleteRecord($table, $idCol, $id) {
    global $mysqli;
    $stmt = $mysqli->prepare("DELETE FROM `$table` WHERE `$idCol`=?");
    if(!$stmt) return ["error"=>$mysqli->error];
    $stmt->bind_param("i",$id);
    $stmt->execute();
    $aff = $stmt->affected_rows;
    $stmt->close();
    return ["success"=>true, "affected_rows"=>$aff];
}

// INSERT / UPDATE
function saveRecord($table, $data, $idCol) {
    global $mysqli;

    // Validierung
    foreach($data as $key=>$val) {
        $err = validateField($table, $key, $val);
        if($err) return ["error"=>$err, "field"=>$key];
    }

    if(isset($data[$idCol])) return updateRecord($table, $data, $idCol);
    return insertRecord($table, $data);
}

function insertRecord($table, $data) {
    global $mysqli;
    $cols = $place = $params = [];
    $types = "";

    foreach($data as $k=>$v) {
        $cols[] = "`$k`";
        $place[] = "?";
        $params[] = $v;
        $types .= is_numeric($v) ? "d" : "s";
    }

    $sql = "INSERT INTO `$table`(".implode(",",$cols).") VALUES(".implode(",",$place).")";
    $stmt = $mysqli->prepare($sql);
    if(!$stmt) return ["error"=>$mysqli->error];

    $bindNames = [&$types];
    foreach($params as &$p) $bindNames[] = &$p;
    call_user_func_array([$stmt,'bind_param'], $bindNames);
    $stmt->execute();
    $id = $stmt->insert_id;
    $stmt->close();
    return ["success"=>true, "id"=>$id];
}

function updateRecord($table, $data, $idCol) {
    global $mysqli;
    $id = $data[$idCol];
    unset($data[$idCol]);

    $set = $params = [];
    $types = "";
    foreach($data as $k=>$v) {
        $set[] = "`$k`=?";
        $params[] = $v;
        $types .= is_numeric($v) ? "d" : "s";
    }

    if(count($set)==0) return ["error"=>"Keine Felder zum Update"];

    $sql = "UPDATE `$table` SET ".implode(",",$set)." WHERE `$idCol`=?";
    $params[] = $id;
    $types.="i";

    $stmt = $mysqli->prepare($sql);
    if(!$stmt) return ["error"=>$mysqli->error];

    $bindNames = [&$types];
    foreach($params as &$p) $bindNames[] = &$p;
    call_user_func_array([$stmt,'bind_param'], $bindNames);
    $stmt->execute();
    $aff = $stmt->affected_rows;
    $stmt->close();
    return ["success"=>true, "affected_rows"=>$aff, "id"=>$id];
}
// GET ALL Records
function getAllRecords($table) {
    global $mysqli;

    $sql = "SELECT * FROM `$table`";
    $res = $mysqli->query($sql);

    if(!$res) {
        return ["error" => $mysqli->error];
    }

    return $res->fetch_all(MYSQLI_ASSOC);
}
?>