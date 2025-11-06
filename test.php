<?php
header('Content-Type: application/json; charset=utf-8');

$mysqli = new mysqli("localhost", "root", "", "Kursverwaltung");
if ($mysqli->connect_error) {
    die(json_encode(["error" => "Verbindung fehlgeschlagen: " . $mysqli->connect_error]));
}

$allowedColumns = ['id_lernende', 'vorname', 'nachname', 'strasse', 'plz', 'ort', 'nr_land', 'geschlecht', 'telefon', 'handy', 'email', 'email_privat', 'birthdate'];

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $sql = "SELECT * FROM tbl_lernende WHERE 1=1";
        $params = [];
        $types = "";

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
        break;
        
    case 'POST':
        break;

    case 'PUT':
        break;
        
    case 'DELETE':
            $sql = "DELETE FROM tbl_lernende WHERE 1=1"
            $params = []
            $types = ""

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
        break;
    
        default:
        echo json_encode(["error" => "HTTP-Methode nicht unterstützt."]);
        break;
}

$mysqli->close();
?>