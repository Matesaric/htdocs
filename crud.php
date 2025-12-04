<?php
/**
 * crud.php
 *
 * Database helper functions for CRUD operations used by the REST dispatcher.
 * Uses mysqli prepared statements and basic sanitization/validation.
 *
 * @package Kursverwaltung
 */
require 'validate.php';

// Datenbankverbindung
$mysqli = new mysqli("localhost", "root", "", "Kursverwaltung");
if($mysqli->connect_error) die(json_encode(["error"=>"DB-Verbindung fehlgeschlagen: ".$mysqli->connect_error]));

// GET Record
/**
 * Hole eine einzelne Zeile anhand der ID.
 *
 * @param string $table Tabellenname (bereinigt intern)
 * @param string $idCol Spaltenname der ID
 * @param int $id ID der gesuchten Zeile
 * @return array|null Assoziatives Array der Zeile oder null, wenn nicht gefunden
 */
function getRecord($table, $idCol, $id) {
    global $mysqli;
    $table = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
    $idCol = preg_replace('/[^a-zA-Z0-9_]/', '', $idCol);
    $id = (int)$id;
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
/**
 * Lösche eine Zeile anhand der ID.
 *
 * @param string $table Tabellenname (bereinigt intern)
 * @param string $idCol Spaltenname der ID
 * @param int $id ID der zu löschenden Zeile
 * @return array Ergebnisarray mit keys `success` und `affected_rows` oder `error`
 */
function deleteRecord($table, $idCol, $id) {
    global $mysqli;
    $table = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
    $idCol = preg_replace('/[^a-zA-Z0-9_]/', '', $idCol);
    $id = (int)$id;
    $stmt = $mysqli->prepare("DELETE FROM `$table` WHERE `$idCol`=?");
    if(!$stmt) return ["error"=>$mysqli->error];
    $stmt->bind_param("i",$id);
    $stmt->execute();
    $aff = $stmt->affected_rows;
    $stmt->close();
    return ["success"=>true, "affected_rows"=>$aff];
}

// INSERT / UPDATE
/**
 * Speichere einen Datensatz: Insert oder Update abhängig von $data[$idCol].
 * Führt Validierung über `validateField` aus und bereinigt Keys/Values.
 *
 * @param string $table Tabellenname
 * @param array $data Assoziatives Array der Daten
 * @param string $idCol Name der ID-Spalte
 * @return array Ergebnisarray oder Fehlerbeschreibung
 */
function saveRecord($table, $data, $idCol) {
    global $mysqli;
    $table = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
    $idCol = preg_replace('/[^a-zA-Z0-9_]/', '', $idCol);
    $sanitized = array();
    foreach($data as $key=>$val) {
        $keyClean = preg_replace('/[^a-zA-Z0-9_]/', '', $key);
        if (is_numeric($val)) {
            $sanitized[$keyClean] = preg_replace('/[^0-9.]/', '', $val);
        } else {
            $sanitized[$keyClean] = trim(strip_tags($val));
        }
        $err = validateField($table, $keyClean, $sanitized[$keyClean]);
        if($err) return ["error"=>$err, "field"=>$keyClean];
    }
    if(isset($sanitized[$idCol])) return updateRecord($table, $sanitized, $idCol);
    return insertRecord($table, $sanitized);
}

/**
 * Führe einen INSERT für die übergebenen Daten aus.
 *
 * @param string $table Tabellenname
 * @param array $data Assoziatives Array der zu insertierenden Daten
 * @return array Ergebnis mit `success` und `id` oder `error`
 */
function insertRecord($table, $data) {
    global $mysqli;
    $table = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
    $cols = $place = $params = [];
    $types = "";
    foreach($data as $k=>$v) {
        $kClean = preg_replace('/[^a-zA-Z0-9_]/', '', $k);
        $cols[] = "`$kClean`";
        $place[] = "?";
        if (is_numeric($v)) {
            $params[] = preg_replace('/[^0-9.]/', '', $v);
            $types .= "d";
        } else {
            $params[] = trim(strip_tags($v));
            $types .= "s";
        }
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

/**
 * Führe ein UPDATE für die übergebenen Daten aus.
 *
 * @param string $table Tabellenname
 * @param array $data Assoziatives Array der zu updatenden Daten (inkl. idCol)
 * @param string $idCol Name der ID-Spalte
 * @return array Ergebnis mit `success` und `affected_rows` oder `error`
 */
function updateRecord($table, $data, $idCol) {
    global $mysqli;
    $table = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
    $idCol = preg_replace('/[^a-zA-Z0-9_]/', '', $idCol);
    $id = isset($data[$idCol]) ? (int)$data[$idCol] : 0;
    unset($data[$idCol]);
    $set = $params = [];
    $types = "";
    foreach($data as $k=>$v) {
        $kClean = preg_replace('/[^a-zA-Z0-9_]/', '', $k);
        $set[] = "`$kClean`=?";
        if (is_numeric($v)) {
            $params[] = preg_replace('/[^0-9.]/', '', $v);
            $types .= "d";
        } else {
            $params[] = trim(strip_tags($v));
            $types .= "s";
        }
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
/**
 * Liefere alle Datensätze der Tabelle als Array von assoziativen Arrays.
 *
 * @param string $table Tabellenname
 * @return array Liste von Datensätzen oder `error`-Array
 */
function getAllRecords($table) {
    global $mysqli;
    $table = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
    $sql = "SELECT * FROM `$table`";
    $res = $mysqli->query($sql);
    if(!$res) {
        return ["error" => $mysqli->error];
    }
    return $res->fetch_all(MYSQLI_ASSOC);
}
?>