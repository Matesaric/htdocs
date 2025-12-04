<?php
require 'handle_request.php';

/**
 * Endpoint für die Ressource "Lehrbetriebe".
 *
 * Dieser Endpunkt stellt CRUD-Funktionen für die Tabelle `tbl_lehrbetriebe`
 * bereit. Darüber können Lehrbetriebe abgefragt, erstellt, aktualisiert oder
 * gelöscht werden.
 *
 * @see handleRequest() führt alle HTTP-Methoden korrekt aus.
 */

$table = 'tbl_lehrbetriebe';
$idCol = 'id_lehrbetrieb';

handleRequest($table, $idCol);
?>