<?php
header('Content-Type: application/json; charset=utf-8');

// Verbindung zur Datenbank
$mysqli = new mysqli("localhost", "root", "", "Kursverwaltung");
if ($mysqli->connect_error) {
    die(json_encode(["error" => "Verbindung fehlgeschlagen: " . $mysqli->connect_error]));
}

// Erlaubte Spalten
$allowedColumns = [
    'id_kurs', 'kursnummer', 'kursthema', 'inhalt', 'nr_dozent', 'startdatum', 'enddatum', 'dauer'
];

// --- Validierung ---
function validateField($key, $value) {
    switch ($key) {
        case 'nr_dozent':
            if (!empty($value) && (!is_numeric($value) || intval($value) <= 0)) {
                return "Ungültige Dozenten-ID: '$value'. Erwartet wird eine positive ganze Zahl.";
            }
            break;

        case 'startdatum':
        case 'enddatum':
            if (!empty($value)) {
                $d = DateTime::createFromFormat('Y-m-d', $value);
                if (!$d || $d->format('Y-m-d') !== $value) {
                    return "Ungültiges Datum für '$key': '$value'. Erwartet wird 'YYYY-MM-DD'.";
                }
            }
            break;

        case 'dauer':
            if (!empty($value) && (!is_numeric($value) || intval($value) <= 0)) {
                return "Ungültige Dauer: '$value'. Erwartet wird eine positive ganze Zahl (Anzahl Tage/Stunden).";
            }
            break;

        case 'kursnummer':
            if (!empty($value) && strlen($value) > 50) {
                return "Kursnummer zu lang. Maximum 50 Zeichen.";
            }
            break;

        case 'kursthema':
            if (!empty($value) && strlen($value) > 100) {
                return "Kursthema zu lang. Maximum 100 Zeichen.";
            }
            break;
    }
    return null;
}

// --- GET ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    if (!isset($_GET['id_kurs'])) {
        die(json_encode(["error" => "Nur Abfrage nach id_kurs erlaubt."]));
    }

    $sql = "SELECT * FROM tbl_kurse WHERE id_kurs = ?";
    $stmt = $mysqli->prepare($sql);
    if (!$stmt) die(json_encode(["error" => "Fehler bei prepare: " . $mysqli->error]));

    $stmt->bind_param("i", $_GET['id_kurs']);
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
            if (in_array($key, $GLOBALS['allowedColumns']) && $value !== null) {
                $err = validateField($key, $value);
                if ($err) {
                    $results[] = ["error" => $err, "id_kurs" => $entry['id_kurs'] ?? null];
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

    if (!isset($_GET['id_kurs'])) {
        die(json_encode(["error" => "Nur Löschen nach id_kurs erlaubt."]));
    }

    $sql = "DELETE FROM tbl_kurse WHERE id_kurs = ?";
    $stmt = $mysqli->prepare($sql);
    if (!$stmt) die(json_encode(["error" => "Fehler bei prepare: " . $mysqli->error]));

    $stmt->bind_param("i", $_GET['id_kurs']);
    $stmt->execute();

    echo json_encode(["success" => true, "affected_rows" => $stmt->affected_rows]);

    $stmt->close();
    $mysqli->close();
    exit;
}

// --- Funktionen ---
function insertOrUpdate($data, $mysqli, $allowedColumns) {
    if (isset($data['id_kurs'])) return updateRecord($data, $mysqli, $allowedColumns);

    $columns = $placeholders = $params = [];
    $types = "";

    foreach ($data as $key => $value) {
        if (in_array($key, $allowedColumns) && $key !== 'id_kurs') {
            $columns[] = "`$key`";
            $placeholders[] = "?";
            $params[] = $value;
            $types .= "s";
        }
    }

    if (count($columns) === 0) {
        return ["error" => "Keine gültigen Felder zum Einfügen angegeben."];
    }

    $sql = "INSERT INTO tbl_kurse (" . implode(",", $columns) . ") VALUES (" . implode(",", $placeholders) . ")";
    $stmt = $mysqli->prepare($sql);
    if (!$stmt) return ["error" => "Fehler bei prepare: " . $mysqli->error];

    $bindNames = [&$types];
    foreach ($params as $i => &$p) $bindNames[] = &$p;

    call_user_func_array([$stmt, 'bind_param'], $bindNames);
    $stmt->execute();

    $insertId = $stmt->insert_id;
    $stmt->close();

    return ["success" => true, "id_kurs" => $insertId];
}

function updateRecord($data, $mysqli, $allowedColumns) {

    if (!isset($data['id_kurs'])) {
        return ["error" => "id_kurs wird für Update benötigt."];
    }

    $id = $data['id_kurs'];
    unset($data['id_kurs']);

    $sql = "UPDATE tbl_kurse SET ";
    $params = $set = [];
    $types = "";

    foreach ($data as $key => $value) {
        if (in_array($key, $allowedColumns) && $key !== 'id_kurs') {
            $set[] = "`$key` = ?";
            $params[] = $value;
            $types .= "s";
        }
    }

    if (count($set) === 0) return ["error" => "Keine gültigen Felder zum Aktualisieren angegeben."];

    $sql .= implode(", ", $set) . " WHERE id_kurs = ?";
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

    return ["success" => true, "affected_rows" => $affected, "id_kurs" => $id];
}
?>