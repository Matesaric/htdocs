<?php
header('Content-Type: application/json; charset=utf-8');

// Verbindung zur Datenbank
$mysqli = new mysqli("localhost", "root", "", "Kursverwaltung");
if ($mysqli->connect_error) {
    die(json_encode(["error" => "Verbindung fehlgeschlagen: " . $mysqli->connect_error]));
}

// Erlaubte Spalten für POST / PUT
$allowedColumns = ['firma', 'strasse', 'plz', 'ort'];

// --- Validierung Funktion ---
function validateField($key, $value) {
    switch ($key) {
        case 'plz':
            if (!preg_match('/^\d{4}$/', $value)) {
                return "Ungültige PLZ: '$value'. Erwartet wird 4-stellig, z.B. '9000'";
            }
            break;
        case 'firma':
        case 'strasse':
        case 'ort':
            if (!empty($value) && strlen($value) > 100) {
                return "Ungültiger Wert für '$key': max. 100 Zeichen erlaubt.";
            }
            break;
    }
    return null;
}

// --- GET nur nach ID ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = $_GET['id_lehrbetrieb'] ?? null;

    if (!$id) {
        die(json_encode(["error" => "Für GET muss 'id_lehrbetrieb' als Parameter übergeben werden."]));
    }

    $stmt = $mysqli->prepare("SELECT * FROM tbl_lehrbetriebe WHERE id_lehrbetrieb = ?");
    if (!$stmt) die(json_encode(["error" => "Fehler bei prepare: " . $mysqli->error]));

    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    $stmt->close();
    $mysqli->close();
    exit;
}

// --- POST / PUT ---
elseif ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    if (empty($data)) die(json_encode(["error" => "Keine Daten übergeben. JSON im Body erwartet."]));

    $isArray = isset($data[0]) && is_array($data[0]);
    $entries = $isArray ? $data : [$data];
    $results = [];

    foreach ($entries as $entry) {
        // --- Validierung ---
        foreach ($entry as $key => $value) {
            if (in_array($key, $GLOBALS['allowedColumns']) && $value !== null) {
                $err = validateField($key, $value);
                if ($err) {
                    $results[] = ["error" => $err, "id_lehrbetrieb" => $entry['id_lehrbetrieb'] ?? null];
                    continue 2;
                }
            }
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $results[] = insertOrUpdate($entry, $mysqli, $allowedColumns);
        } else {
            $results[] = updateRecord($entry, $mysqli, $allowedColumns);
        }
    }

    echo json_encode($isArray ? $results : $results[0]);
    $mysqli->close();
    exit;
}

// --- DELETE nur nach ID ---
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id_lehrbetrieb'] ?? null;

    if (!$id) {
        die(json_encode(["error" => "Für DELETE muss 'id_lehrbetrieb' als Parameter übergeben werden."]));
    }

    $stmt = $mysqli->prepare("DELETE FROM tbl_lehrbetriebe WHERE id_lehrbetrieb = ?");
    if (!$stmt) die(json_encode(["error" => "Fehler bei prepare: " . $mysqli->error]));

    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(["success" => true, "affected_rows" => $stmt->affected_rows]);
    $stmt->close();
    $mysqli->close();
    exit;
}

// --- Funktionen ---
function insertOrUpdate($data, $mysqli, $allowedColumns) {
    if (isset($data['id_lehrbetrieb'])) {
        return updateRecord($data, $mysqli, $allowedColumns);
    }

    $columns = $placeholders = $params = [];
    $types = "";

    foreach ($data as $key => $value) {
        if (in_array($key, $allowedColumns)) {
            $columns[] = "`$key`";
            $placeholders[] = "?";
            $params[] = $value;
            $types .= "s";
        }
    }

    if (count($columns) === 0) return ["error" => "Keine gültigen Felder zum Einfügen angegeben."];

    $sql = "INSERT INTO tbl_lehrbetriebe (" . implode(",", $columns) . ") VALUES (" . implode(",", $placeholders) . ")";
    $stmt = $mysqli->prepare($sql);
    if (!$stmt) return ["error" => "Fehler bei prepare: " . $mysqli->error];

    $bindNames = [&$types];
    foreach ($params as $i => &$p) $bindNames[] = &$p;
    call_user_func_array([$stmt, 'bind_param'], $bindNames);

    $stmt->execute();
    $insertId = $stmt->insert_id;
    $stmt->close();
    return ["success" => true, "id_lehrbetrieb" => $insertId];
}

function updateRecord($data, $mysqli, $allowedColumns) {
    if (!isset($data['id_lehrbetrieb'])) return ["error" => "id_lehrbetrieb wird für Update benötigt."];

    $id = $data['id_lehrbetrieb'];
    unset($data['id_lehrbetrieb']);

    $sql = "UPDATE tbl_lehrbetriebe SET ";
    $params = $set = [];
    $types = "";

    foreach ($data as $key => $value) {
        if (in_array($key, $allowedColumns)) {
            $set[] = "`$key` = ?";
            $params[] = $value;
            $types .= "s";
        }
    }

    if (count($set) === 0) return ["error" => "Keine gültigen Felder zum Aktualisieren angegeben."];

    $sql .= implode(", ", $set) . " WHERE `id_lehrbetrieb` = ?";
    $params[] = $id;
    $types .= "i";

    $stmt = $mysqli->prepare($sql);
    if (!$stmt) return ["error" => "Fehler bei prepare: " . $mysqli->error];

    $bindNames = [&$types];
    foreach ($params as $i => &$p) $bindNames[] = &$p;
    call_user_func_array([$stmt, 'bind_param'], $bindNames);

    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();
    return ["success" => true, "affected_rows" => $affected, "id_lehrbetrieb" => $id];
}
?>
