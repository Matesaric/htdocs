<?php
require 'handle_request.php';

/**
 * Endpoint für die Ressource "Lehrbetriebe-Lernende".
 *
 * Über diesen Endpunkt können Datensätze aus der Tabelle
 * `tbl_lehrbetriebe_lernende` gelesen, erstellt, geändert oder gelöscht
 * werden. Die Zuordnung zwischen Lehrbetrieb und Lernendem wird damit
 * verwaltet.
 *
 * @see handleRequest() übernimmt alle CRUD-Vorgänge.
 */

$table = 'tbl_lehrbetriebe_lernende';
$idCol = 'id_lehrbetriebe_lernende';

handleRequest($table, $idCol);
?>