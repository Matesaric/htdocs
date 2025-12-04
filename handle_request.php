<?php
/**
 * handle_request.php
 *
 * Simple REST-style request dispatcher for a single resource table.
 * Parses PATH_INFO / REQUEST_URI for an optional resource id, reads JSON body,
 * sanitizes inputs and delegates to CRUD functions in `crud.php`.
 *
 * @package Kursverwaltung
 */
require 'crud.php';

/**
 * Dispatch an HTTP request for the given table/resource.
 *
 * Reads the request method, optional ID from the path or query, sanitizes
 * inputs and calls the appropriate CRUD helper. Responses are returned as
 * JSON and appropriate HTTP status codes are set.
 *
 * @param string $table Database table name (trusted/hardcoded per resource file)
 * @param string $idCol Name of the ID column in the table (e.g. 'id_dozent')
 * @return void Outputs JSON and sets HTTP status code; exits on completion.
 */
function handleRequest($table, $idCol) {
    header('Content-Type: application/json; charset=utf-8');

    $id = null;
    if (!empty($_SERVER['PATH_INFO'])) {
        $path = trim($_SERVER['PATH_INFO'], '/');
        if ($path !== '') {
            $parts = explode('/', $path);
            $id = preg_replace('/[^0-9]/', '', $parts[0]);
        }
    } else {
        $script = $_SERVER['SCRIPT_NAME'] ?? '';
        $uri = $_SERVER['REQUEST_URI'] ?? '';
        if ($script !== '' && strpos($uri, $script) === 0) {
            $rest = substr($uri, strlen($script));
            $rest = parse_url($rest, PHP_URL_PATH);
            $rest = trim($rest, '/');
            if ($rest !== '') {
                $parts = explode('/', $rest);
                $id = preg_replace('/[^0-9]/', '', $parts[0]);
            }
        }
    }

    if (isset($_GET['all'])) {
        $all = filter_var($_GET['all'], FILTER_VALIDATE_BOOLEAN);
        if ($all) {
            http_response_code(200);
            echo json_encode(getAllRecords($table));
            exit;
        }
    }

    if (!$id && isset($_GET[$idCol])) {
        $id = preg_replace('/[^0-9]/', '', $_GET[$idCol]);
    }

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    switch ($method) {
        case 'GET':
            if (!$id) {
                http_response_code(200);
                echo json_encode(getAllRecords($table));
                exit;
            }
            $record = getRecord($table, $idCol, (int)$id);
            if (!$record) {
                http_response_code(404);
                echo json_encode(["error" => "Nicht gefunden"]);
            } else {
                http_response_code(200);
                echo json_encode($record);
            }
            exit;

        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(["error"=>"ID fehlt"]);
                exit;
            }
            $res = deleteRecord($table, $idCol, (int)$id);
            if (isset($res['error'])) {
                http_response_code(500);
                echo json_encode($res);
            } else {
                if (($res['affected_rows'] ?? 0) > 0) {
                    http_response_code(204);
                } else {
                    http_response_code(404);
                    echo json_encode(["error"=>"Nicht gefunden"]);
                }
            }
            exit;

        case 'POST':
            if ($id) {
                http_response_code(400);
                echo json_encode(["error"=>"POST an spezifische Ressource nicht erlaubt"]);
                exit;
            }
            $input = json_decode(file_get_contents("php://input"), true);
            if (!$input || !is_array($input)) {
                http_response_code(400);
                echo json_encode(["error"=>"Keine Daten übergeben oder ungültiges JSON"]);
                exit;
            }
            $sanitized = array();
            foreach ($input as $k => $v) {
                if (is_numeric($v)) {
                    $sanitized[$k] = preg_replace('/[^0-9.]/', '', $v);
                } else {
                    $sanitized[$k] = trim(strip_tags($v));
                }
            }
            $res = insertRecord($table, $sanitized);
            if (isset($res['error'])) {
                http_response_code(500);
                echo json_encode($res);
            } else {
                $newId = $res['id'] ?? null;
                if ($newId) {
                    $base = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/');
                    $location = ($base === '' ? '' : $base) . '/' . $newId;
                    header("Location: {$location}", true, 201);
                    echo json_encode(["success"=>true,"id"=>$newId]);
                } else {
                    http_response_code(201);
                    echo json_encode($res);
                }
            }
            exit;

        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(["error"=>"ID fehlt für PUT"]);
                exit;
            }
            $input = json_decode(file_get_contents("php://input"), true);
            if (!$input || !is_array($input)) {
                http_response_code(400);
                echo json_encode(["error"=>"Keine Daten übergeben oder ungültiges JSON"]);
                exit;
            }
            $sanitized = array();
            foreach ($input as $k => $v) {
                if (is_numeric($v)) {
                    $sanitized[$k] = preg_replace('/[^0-9.]/', '', $v);
                } else {
                    $sanitized[$k] = trim(strip_tags($v));
                }
            }
            $sanitized[$idCol] = (int)$id;
            $res = saveRecord($table, $sanitized, $idCol);
            if (isset($res['error'])) {
                http_response_code(400);
                echo json_encode($res);
            } else {
                http_response_code(200);
                echo json_encode($res);
            }
            exit;

        default:
            header('Allow: GET, POST, PUT, DELETE');
            http_response_code(405);
            echo json_encode(["error"=>"Methode nicht erlaubt"]);
            exit;
    }
}
?>