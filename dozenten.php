<?php
header('Content-Type: application/json; charset=utf-8');

// Verbindung zur Datenbank
$mysqli = new mysqli("localhost", "root", "", "Kursverwaltung");
if ($mysqli->connect_error) {
    die(json_encode(["error" => "Verbindung fehlgeschlagen: " . $mysqli->connect_error]));
}

// Erlaubte Spalten
$allowedColumns = [
    'id_dozent','vorname','nachname','strasse','plz','ort', 'nr_land','geschlecht','telefon','handy','email','birthdate'
];

// --- Validierung ---
function validateField($key, $value) {
    switch ($key) {
        case 'plz':
            if (!empty($value) && !preg_match('/^\d{4}$/', $value)) {
                return "Ungültige PLZ: '$value'. Erwartet wird 4-stellig, z.B. '9000'";
            }
            break;
        case 'telefon':
            if (!empty($value) && !preg_match('/^\d{2,4}\s?\d{5,7}$/', $value)) {
                return "Ungültige Telefonnummer: '$value'. Erwartet wird z.B. '0312234567'";
            }
            break;
        case 'handy':
            if (!empty($value) && !preg_match('/^07\d{2}\s?\d{6,7}$/', $value)) {
                return "Ungültige Handynummer: '$value'. Erwartet wird z.B. '0787654321'";
            }
            break;
        case 'email':
        case 'email_privat':
            if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                return "Ungültige E-Mail-Adresse: '$value'";
            }
            break;
        case 'birthdate':
            if (!empty($value)) {
                $d = DateTime::createFromFormat('Y-m-d', $value);
                if (!$d || $d->format('Y-m-d') !== $value) {
                    return "Ungültiges Geburtsdatum: '$value'. Erwartet wird 'YYYY-MM-DD'";
                }
            }
            break;
        case 'geschlecht':
            if (!empty($value) && !in_array($value, ['m','w','d'])) {
                return "Ungültiges Geschlecht: '$value'. Erwartet wird 'm', 'w' oder 'd'";
            }
            break;
        case 'nr_land':
            if (!empty($value) && (!is_numeric($value) || intval($value) <= 0)) {
                return "Ungültige Länder-ID: '$value'. Erwartet wird positive Zahl.";
            }
            break;
    }
    return null;
}

// --- GET ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['id_dozent'])) {
        die(json_encode(["error" => "Nur Abfrage nach id_dozent erlaubt."]));
    }

    $sql = "SELECT * FROM tbl_dozenten WHERE id_dozent = ?";
    $stmt = $mysqli->prepare($sql);
    if (!$stmt) die(json_encode(["error" => "Fehler bei prepare: " . $mysqli->error]));

    $stmt->bind_param("i", $_GET['id_dozent']);
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
        foreach ($entry as $key => $value) {
            if (in_array($key, $allowedColumns) && $value !== null) {
                $err = validateField($key, $value);
                if ($err) {
                    $results[] = ["error" => $err, "id_dozent" => $entry['id_dozent'] ?? null];
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

// --- DELETE ---
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_GET['id_dozent'])) {
        die(json_encode(["error" => "Nur Löschen nach id_dozent erlaubt."]));
    }

    $sql = "DELETE FROM tbl_dozenten WHERE id_dozent = ?";
    $stmt = $mysqli->prepare($sql);
    if (!$stmt) die(json_encode(["error" => "Fehler bei prepare: " . $mysqli->error]));

    $stmt->bind_param("i", $_GET['id_dozent']);
    $stmt->execute();
    echo json_encode(["success" => true, "affected_rows" => $stmt->affected_rows]);
    $stmt->close();
    $mysqli->close();
    exit;
}

// --- Funktionen ---
function insertOrUpdate($data, $mysqli, $allowedColumns) {
    if (isset($data['id_dozent'])) return updateRecord($data, $mysqli, $allowedColumns);

    $columns = $placeholders = $params = [];
    $types = "";

    foreach ($data as $key => $value) {
        if (in_array($key, $allowedColumns) && $key !== 'id_dozent') {
            $columns[] = "`$key`";
            $placeholders[] = "?";
            $params[] = $value;
            $types .= "s";
        }
    }

    if (count($columns) === 0) return ["error" => "Keine gültigen Felder zum Einfügen angegeben."];

    $sql = "INSERT INTO tbl_dozenten (" . implode(",", $columns) . ") VALUES (" . implode(",", $placeholders) . ")";
    $stmt = $mysqli->prepare($sql);
    if (!$stmt) return ["error" => "Fehler bei prepare: " . $mysqli->error];

    $bindNames = [&$types];
    foreach ($params as $i => &$p) $bindNames[] = &$p;
    call_user_func_array([$stmt, 'bind_param'], $bindNames);

    $stmt->execute();
    $insertId = $stmt->insert_id;
    $stmt->close();
    return ["success" => true, "id_dozent" => $insertId];
}

function updateRecord($data, $mysqli, $allowedColumns) {
    if (!isset($data['id_dozent'])) return ["error" => "id_dozent wird für Update benötigt."];

    $id = $data['id_dozent'];
    unset($data['id_dozent']);

    $sql = "UPDATE tbl_dozenten SET ";
    $params = $set = [];
    $types = "";

    foreach ($data as $key => $value) {
        if (in_array($key, $allowedColumns) && $key !== 'id_dozent') {
            $set[] = "`$key` = ?";
            $params[] = $value;
            $types .= "s";
        }
    }

    if (count($set) === 0) return ["error" => "Keine gültigen Felder zum Aktualisieren angegeben."];

    $sql .= implode(", ", $set) . " WHERE id_dozent = ?";
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
    return ["success" => true, "affected_rows" => $affected, "id_dozent" => $id];
}
?>