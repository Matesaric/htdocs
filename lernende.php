<?php
require 'handle_request.php';

/**
 * Endpoint für die Ressource "Lernende".
 *
 * Dieser Endpunkt behandelt CRUD-Operationen auf der Tabelle `tbl_lernende`.
 * Er ermöglicht das Erstellen, Lesen, Ändern und Löschen von Lernenden.
 *
 * @see handleRequest() kümmert sich um die gesamte Request-Verarbeitung.
 */

$table = 'tbl_lernende';
$idCol = 'id_lernende';

handleRequest($table, $idCol);
?>