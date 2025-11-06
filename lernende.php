<?php
header('Content-Type: application/json; charset=utf-8');

$mysqli = new mysqli("localhost", "root", "", "Kursverwaltung");
if ($mysqli->connect_error) {
    die(json_encode(["error" => "Verbindung fehlgeschlagen: " . $mysqli->connect_error]));
}

$allowedColumns = ['id_lernende', 'vorname', 'nachname', 'strasse', 'plz', 'ort', 'nr_land', 'geschlecht', 'telefon', 'handy', 'email', 'email_privat', 'birthdate'];

// Prüfen, ob es sich um eine GET-Anfrage handelt
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $sql = "SELECT * FROM tbl_lernende WHERE 1=1";
    $params = [];
    $types = "";

    // Nur wenn GET-Parameter vorhanden sind
    if (!empty($_GET)) {
        foreach ($_GET as $key => $value) {
            if (in_array($key, $allowedColumns)) {
                $sql .= " AND $key = ?";
                $params[] = $value;
                $types .= "s";
            }
        }
    }

    $stmt = $mysqli->prepare($sql);
    if (!$stmt) {
        die(json_encode(["error" => "Fehler bei prepare: " . $mysqli->error]));
    }

    if ($params) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode($data);

    $stmt->close();
}
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {

    $sql = "DELETE FROM tbl_lernende WHERE 1=1";
    $params = [];
    $types = "";

    // Nur wenn DELETE-Parameter vorhanden sind
    if (!empty($_DELETE)) {
        foreach ($_DELETE as $key => $value) {
            if (in_array($key, $allowedColumns)) {
                $sql .= " AND $key = ?";
                $params[] = $value;
                $types .= "s";
            }
        }
    }

    $stmt = $mysqli->prepare($sql);
    if (!$stmt) {
        die(json_encode(["error" => "Fehler bei prepare: " . $mysqli->error]));
    }

    if ($params) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode($data);

    $stmt->close();
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $params = [];
    $types = "";
    $columns = [];
    $placeholders = [];

    foreach ($_POST as $key => $value) {
        if (in_array($key, $allowedColumns)) {
            $columns[] = $key;
            $placeholders[] = "?";
            $params[] = $value;
            $types .= "s"; // oder passende Typen
        }
    }

    $sql = "INSERT INTO tbl_lernende (" . implode(",", $columns) . ") VALUES (" . implode(",", $placeholders) . ")";
    $stmt = $mysqli->prepare($sql);

    if (!$stmt) {
        die(json_encode(["error" => "Fehler bei prepare: " . $mysqli->error]));
    }

    if ($params) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();

    echo json_encode(["success" => true, "id" => $stmt->insert_id]);

    $stmt->close();
}
// Verbindung schliessen
$mysqli->close();
?>
