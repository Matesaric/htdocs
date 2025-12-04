<?php
require 'handle_request.php';

/**
 * Endpoint für die Ressource "Kurse-Lernende".
 *
 * Dieser Endpunkt verarbeitet alle CRUD-Operationen für die Tabelle
 * `tbl_kurse_lernende`. Die Funktion handleRequest übernimmt dabei alle
 * HTTP-Methoden wie GET, POST, PUT und DELETE.
 *
 * @see handleRequest() Zuständig für Routing und CRUD-Handling.
 */

$table = 'tbl_kurse_lernende';
$idCol = 'id_kurse_lernende';

handleRequest($table, $idCol);
?>