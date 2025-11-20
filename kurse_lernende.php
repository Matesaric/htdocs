<?php
header('Content-Type: application/json; charset=utf-8');

// Verbindung zur Datenbank
$mysqli = new mysqli("localhost", "root", "", "Kursverwaltung");
if ($mysqli->connect_error) {
    die(json_encode(["error" => "Verbindung fehlgeschlagen: " . $mysqli->connect_error]));
}

// Erlaubte Spalten
$allowedColumns = ['id_kurse_lernende', 'nr_kurs', 'nr_lernende', 'note'];

// --- Validierung ---
function validateField($key, $value) {

    switch ($key) {

        case 'nr_kurs':
        case 'nr_lernende':
            if (!is_numeric($value) || intval($value) <= 0) {
                return "Ungültige ID für '$key': '$value'. Erwartet wird eine positive ganze Zahl.";
            }
            break;

        case 'note':
            if ($value !== null && $value !== "") {

                if (!is_numeric($value)) {
                    return "Ungültige Note: '$value'. Muss eine Zahl sein.";
                }

                $n = floatval($value);

                if ($n < 1.0 || $n > 6.0) {
                    return "Ungültige Note: '$value'. Erlaubt ist 1.0 bis 6.0.";
                }
            }
            break;
    }

    return null;
}

// --- GET ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    if (!isset($_GET['id_kurse_lernende'])) {
        die(json_encode(["error" => "Nur Abfrage nach id_kurse_lernende erlaubt."]));
    }

    $sql = "SELECT * FROM tbl_kurse_lernende WHERE id_kurse_lernende = ?";
    $stmt = $mysqli->prepare($sql);
    if (!$stmt) {
        die(json_encode(["error" => "Fehler bei prepare: " . $mysqli->error]));
    }

    $stmt->bind_param("i", $_GET['id_kurse_lernende']);
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

    if (empty($data)) {
        die(json_encode(["error" => "Keine Daten übergeben. JSON im Body erwartet."]));
    }

    $isArray = isset($data[0]) && is_array($data[0]);
    $entries = $isArray ? $data : [$data];

    $results = [];

    foreach ($entries as $entry) {

        // --- Validierung ---
        foreach ($entry as $key => $value) {
            if (in_array($key, $allowedColumns)) {
                $err = validateField($key, $value);
                if ($err) {
                    $results[] = [
                        "error" => $err,
                        "id_kurse_lernende" => $entry['id_kurse_lernende'] ?? null
                    ];
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

    if (!isset($_GET['id_kurse_lernende'])) {
        die(json_encode(["error" => "Nur Löschen nach id_kurse_lernende erlaubt."]));
    }

    $sql = "DELETE FROM tbl_kurse_lernende WHERE id_kurse_lernende = ?";
    $stmt = $mysqli->prepare($sql);
    if (!$stmt) {
        die(json_encode(["error" => "Fehler bei prepare: " . $mysqli->error]));
    }

    $stmt->bind_param("i", $_GET['id_kurse_lernende']);
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "affected_rows" => $stmt->affected_rows
    ]);

    $stmt->close();
    $mysqli->close();
    exit;
}

// --- Funktionen ---
function insertOrUpdate($data, $mysqli, $allowedColumns) {

    if (isset($data['id_kurse_lernende'])) {
        return updateRecord($data, $mysqli, $allowedColumns);
    }

    $columns = $placeholders = $params = [];
    $types = "";

    foreach ($data as $key => $value) {

        if (in_array($key, $allowedColumns) && $key !== 'id_kurse_lernende') {

            $columns[] = "`$key`";
            $placeholders[] = "?";
            $params[] = $value;

            $types .= (is_numeric($value) ? "d" : "s");
        }
    }

    if (count($columns) === 0) {
        return ["error" => "Keine gültigen Felder zum Einfügen angegeben."];
    }

    $sql = "INSERT INTO tbl_kurse_lernende (" .
        implode(",", $columns) .
        ") VALUES (" .
        implode(",", $placeholders) .
        ")";

    $stmt = $mysqli->prepare($sql);
    if (!$stmt) {
        return ["error" => "Fehler bei prepare: " . $mysqli->error];
    }

    $bindNames = [&$types];
    foreach ($params as &$p) $bindNames[] = &$p;

    call_user_func_array([$stmt, 'bind_param'], $bindNames);
    $stmt->execute();

    $insertId = $stmt->insert_id;
    $stmt->close();

    return ["success" => true, "id_kurse_lernende" => $insertId];
}

function updateRecord($data, $mysqli, $allowedColumns) {

    if (!isset($data['id_kurse_lernende'])) {
        return ["error" => "id_kurse_lernende wird für Update benötigt."];
    }

    $id = $data['id_kurse_lernende'];
    unset($data['id_kurse_lernende']);

    $sql = "UPDATE tbl_kurse_lernende SET ";
    $params = $set = [];
    $types = "";

    foreach ($data as $key => $value) {

        if (in_array($key, $allowedColumns) && $key !== 'id_kurse_lernende') {

            $set[] = "`$key` = ?";
            $params[] = $value;

            $types .= (is_numeric($value) ? "d" : "s");
        }
    }

    if (count($set) === 0) {
        return ["error" => "Keine gültigen Felder zum Aktualisieren angegeben."];
    }

    $sql .= implode(", ", $set) . " WHERE id_kurse_lernende = ?";
    $params[] = $id;
    $types .= "i";

    $stmt = $mysqli->prepare($sql);
    if (!$stmt) {
        return ["error" => "Fehler bei prepare: " . $mysqli->error];
    }

    $bindNames = [&$types];
    foreach ($params as &$p) $bindNames[] = &$p;

    call_user_func_array([$stmt, 'bind_param'], $bindNames);
    $stmt->execute();

    $affected = $stmt->affected_rows;
    $stmt->close();

    return [
        "success" => true,
        "affected_rows" => $affected,
        "id_kurse_lernende" => $id
    ];
}
?>