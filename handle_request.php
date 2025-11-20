<?php
require 'crud.php';

function handleRequest($table, $idCol) {
    $id = $_GET[$idCol] ?? null;

    switch($_SERVER['REQUEST_METHOD']) {

        case 'GET':
            if(!$id) die(json_encode(["error"=>"ID fehlt"]));
            echo json_encode(getRecord($table, $idCol, $id));
            exit;

        case 'DELETE':
            if(!$id) die(json_encode(["error"=>"ID fehlt"]));
            echo json_encode(deleteRecord($table, $idCol, $id));
            exit;

        case 'POST':
        case 'PUT':
            $input = json_decode(file_get_contents("php://input"), true);
            if(!$input) die(json_encode(["error"=>"Keine Daten übergeben"]));
            echo json_encode(saveRecord($table, $input, $idCol));
            exit;

        default:
            echo json_encode(["error"=>"Methode nicht erlaubt"]);
            exit;
    }
}
?>
