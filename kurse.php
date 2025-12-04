<?php
require 'handle_request.php';

/**
 * Endpoint für die Ressource "Kurse".
 *
 * Dieser Endpunkt kümmert sich um alle CRUD-Aktionen für die Tabelle
 * `tbl_kurse`. Über handleRequest werden alle API-Anfragen korrekt
 * verarbeitet und als JSON zurückgegeben.
 *
 * @see handleRequest() zentrale Funktion für die API-Logik.
 */

$table = 'tbl_kurse';
$idCol = 'id_kurs';

handleRequest($table, $idCol);
?>