<?php
require 'handle_request.php';

/**
 * Initialisiert die Request-Verarbeitung für die Ressource "Dozenten".
 *
 * Dieses Skript dient als Endpunkt für alle CRUD-Operationen auf der Tabelle
 * `tbl_dozenten`. Es lädt die zentrale `handleRequest()`-Funktion, übergibt
 * den Tabellennamen sowie die zugehörige ID-Spalte und verarbeitet anschließend
 * automatisch GET/POST/PUT/DELETE-Requests.
 *
 * Beispielaufrufe:
 *  - GET    /api/dozenten          → Liste aller Dozenten
 *  - GET    /api/dozenten/7        → Einzelnen Dozenten abrufen
 *  - POST   /api/dozenten          → Neuen Dozenten erstellen
 *  - PUT    /api/dozenten/7        → Dozenten aktualisieren
 *  - DELETE /api/dozenten/7        → Dozenten löschen
 *
 * @see handleRequest() Hauptfunktion für Request-Dispatching und CRUD-Handling.
 */

$table = 'tbl_dozenten';   // Datenbanktabelle für diese Ressource
$idCol = 'id_dozent';      // Primärschlüsselspalte der Tabelle

handleRequest($table, $idCol);
?>