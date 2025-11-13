<?php
header('Content-Type: application/json; charset=utf-8');

// Verbindung zur Datenbank
$mysqli = new mysqli("localhost", "root", "", "Kursverwaltung");
if ($mysqli->connect_error) {
    die(json_encode(["error" => "Verbindung fehlgeschlagen: " . $mysqli->connect_error]));
}

$allowedColumns = ['id_lernende', 'vorname', 'nachname', 'strasse', 'plz', 'ort', 'nr_land', 'geschlecht', 'telefon', 'handy', 'email', 'email_privat', 'birthdate'
];

// --- Validierung Funktion ---
function validateField($key, $value) {
    switch ($key) {
        case 'email':
            if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                return "Ungültige E-Mail-Adresse: '$value'. Erwartet wird z.B. 'name@domain.ch'";
            }
            break;
        case 'email_privat':
            if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                return "Ungültige private E-Mail-Adresse: '$value'. Erwartet wird z.B. 'name@gmail.com'";
            }
            break;
        case 'telefon':
            if (!preg_match('/^\d{2,4}\s?\d{5,7}$/', $value)) {
                return "Ungültige Telefonnummer: '$value'. Erwartet wird z.B. '0312234567'";
            }
            break;
        case 'handy':
            if (!preg_match('/^\d{2,4}\s?\d{5,7}$/', $value)) {
                return "Ungültige Telefonnummer: '$value'. Erwartet wird z.B. '0312234567'";
            }
            break;
        case 'plz':
            if (!preg_match('/^\d{4}$/', $value)) {
                return "Ungültige PLZ: '$value'. Erwartet wird 4-stellig, z.B. '9000'";
            }
            break;
        case 'birthdate':
            $d = DateTime::createFromFormat('Y-m-d', $value);
            if (!$d || $d->format('Y-m-d') !== $value) {
                return "Ungültiges Geburtsdatum: '$value'. Erwartet wird 'YYYY-MM-DD', z.B. '2004-09-22'";
            }
            break;
        case 'geschlecht':
            if (!in_array($value, ['m', 'w', 'd', ''])) {
                return "Ungültiges Geschlecht: '$value'. Erwartet wird 'm', 'w' oder 'd'";
            }
            break;
        case 'nr_land':
            if (!is_numeric($value) || intval($value) != $value || $value < 0) {
                return "Ungültige Länder-Nummer: '$value'. Erwartet wird eine ganze Zahl, z.B. 1 für Schweiz.";
            }
            break;
    }
    return null;
}

// --- GET ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    foreach ($_GET as $key => $value) {
        if ($key !== 'id_lernende') {
            die(json_encode(["error" => "Ungültiger Parameter '$key'. Nur 'id_lernende' darf in der URL verwendet werden."]));
        }
    }

    $sql = "SELECT * FROM tbl_lernende";
    if (isset($_GET['id_lernende'])) {
        $sql .= " WHERE id_lernende = ?";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("i", $_GET['id_lernende']);
    } else {
        $stmt = $mysqli->prepare($sql);
    }

    if (!$stmt) die(json_encode(["error" => "Fehler bei prepare: " . $mysqli->error]));
    $stmt->execute();
    $res = $stmt->get_result();
    echo json_encode($res->fetch_all(MYSQLI_ASSOC));
    $stmt->close();
    $mysqli->close();
    exit;
}

// --- POST ---
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data)) die(json_encode(["error" => "Keine Daten übergeben. JSON im Body erwartet."]));

    $errors = [];
    foreach ($data as $key => $val) {
        if (in_array($key, $allowedColumns) && $val !== null) {
            $err = validateField($key, $val);
            if ($err) $errors[] = $err;
        }
    }
    if ($errors) die(json_encode(["error" => $errors]));

    $cols = $vals = [];
    $types = "";
    foreach ($data as $key => $val) {
        if (in_array($key, $allowedColumns) && $key !== 'id_lernende') {
            $cols[] = "`$key`";
            $vals[] = "?";
            $types .= "s";
        }
    }

    if (empty($cols)) die(json_encode(["error" => "Keine gültigen Felder für INSERT angegeben."]));

    $sql = "INSERT INTO tbl_lernende (" . implode(",", $cols) . ") VALUES (" . implode(",", $vals) . ")";
    $stmt = $mysqli->prepare($sql);
    $bind = [&$types];
    foreach ($data as $key => &$val) {
        if (in_array($key, $allowedColumns) && $key !== 'id_lernende') $bind[] = &$val;
    }
    call_user_func_array([$stmt, 'bind_param'], $bind);
    $stmt->execute();
    echo json_encode(["success" => true, "id_lernende" => $stmt->insert_id]);
    $stmt->close();
    $mysqli->close();
    exit;
}

// --- PUT ---
elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data) || empty($data['id_lernende'])) {
        die(json_encode(["error" => "id_lernende wird für Update benötigt."]));
    }

    $errors = [];
    foreach ($data as $key => $val) {
        if (in_array($key, $allowedColumns) && $val !== null) {
            $err = validateField($key, $val);
            if ($err) $errors[] = $err;
        }
    }
    if ($errors) die(json_encode(["error" => $errors]));

    $id = $data['id_lernende'];
    unset($data['id_lernende']);

    $set = [];
    $types = "";
    $params = [];
    foreach ($data as $key => $val) {
        if (in_array($key, $allowedColumns)) {
            $set[] = "`$key` = ?";
            $types .= "s";
            $params[] = $val;
        }
    }

    if (empty($set)) die(json_encode(["error" => "Keine gültigen Felder zum Aktualisieren angegeben."]));

    $sql = "UPDATE tbl_lernende SET " . implode(", ", $set) . " WHERE id_lernende = ?";
    $types .= "i";
    $params[] = $id;

    $stmt = $mysqli->prepare($sql);
    $bind = [&$types];
    foreach ($params as &$p) $bind[] = &$p;
    call_user_func_array([$stmt, 'bind_param'], $bind);
    $stmt->execute();
    echo json_encode(["success" => true, "affected_rows" => $stmt->affected_rows]);
    $stmt->close();
    $mysqli->close();
    exit;
}

// --- DELETE ---
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data)) $data = $_GET;

    if (empty($data['id_lernende'])) die(json_encode(["error" => "Bitte 'id_lernende' angeben."]));
    if (count($data) > 1) die(json_encode(["error" => "Nur 'id_lernende' darf übergeben werden."]));

    $stmt = $mysqli->prepare("DELETE FROM tbl_lernende WHERE id_lernende = ?");
    $stmt->bind_param("i", $data['id_lernende']);
    $stmt->execute();
    echo json_encode(["success" => true, "affected_rows" => $stmt->affected_rows]);
    $stmt->close();
    $mysqli->close();
    exit;
}
?>