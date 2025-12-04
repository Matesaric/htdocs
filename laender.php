<?php
require 'handle_request.php';

/**
 * Endpoint für die Ressource "Countries".
 *
 * Dieser Endpunkt stellt CRUD-Funktionen für die Tabelle `tbl_countries`
 * bereit. Er ermöglicht das Abrufen, Erstellen, Aktualisieren und Löschen
 * von Länder-Datensätzen.
 *
 * @see handleRequest() Führt die Logik für die einzelnen HTTP-Methoden aus.
 */

$table = 'tbl_countries';
$idCol = 'id_country';

handleRequest($table, $idCol);
?>