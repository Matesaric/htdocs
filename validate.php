<?php
/**
 * Validates a single field/value pair for a specific database table.
 *
 * Diese Funktion prüft anhand des Tabellennamens ($table) und des Feldnamens ($key),
 * ob der übergebene Wert ($value) gültig ist. Jede Tabelle hat dabei eigene Regeln
 * wie Maximallängen, Datumsformatierungen, Nummernprüfungen oder erlaubte Werte.
 *
 * Bei ungültigen Eingaben wird ein Fehlertext zurückgegeben, ansonsten `null`.
 *
 * Beispiele für Validierungen:
 * - Strings dürfen bestimmte Längen nicht überschreiten.
 * - IDs müssen numerisch und > 0 sein.
 * - Datumsfelder müssen im Format YYYY-MM-DD valide sein.
 * - E-Mails müssen RFC-konform sein.
 * - Telefonnummern folgen einem eingeschränkten Zeichenmuster.
 *
 * @param string $table Name der Datenbanktabelle (z. B. `tbl_countries`, `tbl_lernende`).
 * @param string $key   Der zu prüfende Feldname innerhalb der Tabelle.
 * @param mixed  $value Der Wert, der validiert werden soll.
 *
 * @return string|null Gibt eine Fehlermeldung zurück oder `null`, wenn der Wert gültig ist.
 */
function validateField($table, $key, $value) {

    switch($table) {

        // Länder
        case 'tbl_countries':
            if($key == 'country') {
                if(empty($value) || strlen($value) > 100) {
                    return "Ungültiger Ländername: $value. Maximal 100 Zeichen.";
                }
            }
            break;

        // Lehrbetriebe
        case 'tbl_lehrbetriebe':
            if($key == 'firma') {
                if(empty($value) || strlen($value) > 100) {
                    return "Ungültiger Firmenname: $value. Maximal 100 Zeichen.";
                }
            }
            if($key == 'strasse' || $key == 'ort') {
                if(!empty($value) && strlen($value) > 100) {
                    return "Zu langes Feld $key: $value. Maximal 100 Zeichen.";
                }
            }
            if($key == 'plz') {
                if(!empty($value) && !preg_match('/^\d{4,10}$/', $value)) {
                    return "Ungültige Postleitzahl: $value";
                }
            }
            break;

        // Lernende
        case 'tbl_lernende':
            if(in_array($key, ['vorname','nachname'])) {
                if(empty($value) || strlen($value) > 50) {
                    return "$key darf nicht leer sein und max. 50 Zeichen.";
                }
            }
            if(in_array($key, ['strasse','ort'])) {
                if(!empty($value) && strlen($value) > 100) {
                    return "$key zu lang. Maximal 100 Zeichen.";
                }
            }
            if($key == 'plz') {
                if(!empty($value) && !preg_match('/^\d{4,10}$/', $value)) {
                    return "Ungültige Postleitzahl: $value";
                }
            }
            if($key == 'nr_land') {
                if(!empty($value) && (!is_numeric($value) || intval($value)<=0)) {
                    return "Ungültige Länder-ID: $value";
                }
            }
            if($key == 'geschlecht') {
                if(!empty($value) && !in_array($value,['m','w','d'])) {
                    return "Ungültiges Geschlecht: $value";
                }
            }
            if(in_array($key, ['telefon','handy'])) {
                if(!empty($value) && !preg_match('/^[0-9 +()-]{0,20}$/', $value)) {
                    return "Ungültige Telefonnummer: $value";
                }
            }
            if(in_array($key, ['email','email_privat'])) {
                if(!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    return "Ungültige Email: $value";
                }
            }
            if($key == 'birthdate') {
                if(!empty($value)) {
                    $d = DateTime::createFromFormat('Y-m-d', $value);
                    if(!$d || $d->format('Y-m-d') !== $value) {
                        return "Ungültiges Datum: $value. Erwartet YYYY-MM-DD.";
                    }
                }
            }
            break;

        // Dozenten
        case 'tbl_dozenten':
            if(in_array($key, ['vorname','nachname'])) {
                if(empty($value) || strlen($value) > 50) {
                    return "$key darf nicht leer sein und max. 50 Zeichen.";
                }
            }
            if(in_array($key, ['strasse','ort'])) {
                if(!empty($value) && strlen($value) > 100) {
                    return "$key zu lang. Maximal 100 Zeichen.";
                }
            }
            if($key == 'plz') {
                if(!empty($value) && !preg_match('/^\d{4,10}$/', $value)) {
                    return "Ungültige Postleitzahl: $value";
                }
            }
            if($key == 'nr_land') {
                if(!empty($value) && (!is_numeric($value) || intval($value)<=0)) {
                    return "Ungültige Länder-ID: $value";
                }
            }
            if($key == 'geschlecht') {
                if(!empty($value) && !in_array($value,['m','w','d'])) {
                    return "Ungültiges Geschlecht: $value";
                }
            }
            if(in_array($key, ['telefon','handy'])) {
                if(!empty($value) && !preg_match('/^[0-9 +()-]{0,20}$/', $value)) {
                    return "Ungültige Telefonnummer: $value";
                }
            }
            if($key == 'email') {
                if(!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    return "Ungültige Email: $value";
                }
            }
            if($key == 'birthdate') {
                if(!empty($value)) {
                    $d = DateTime::createFromFormat('Y-m-d', $value);
                    if(!$d || $d->format('Y-m-d') !== $value) {
                        return "Ungültiges Datum: $value. Erwartet YYYY-MM-DD.";
                    }
                }
            }
            break;

        // Lehrbetriebe-Lernende
        case 'tbl_lehrbetriebe_lernende':
            if($key == 'nr_lehrbetrieb' || $key == 'nr_lernende') {
                if(!is_numeric($value) || intval($value)<=0) {
                    return "Ungültige ID für $key: $value";
                }
            }
            if($key == 'start' || $key == 'ende') {
                if(!empty($value)) {
                    $d = DateTime::createFromFormat('Y-m-d', $value);
                    if(!$d || $d->format('Y-m-d') !== $value) {
                        return "Ungültiges Datum $key: $value";
                    }
                }
            }
            if($key == 'beruf' && !empty($value) && strlen($value) > 100) {
                return "Beruf zu lang: $value. Maximal 100 Zeichen.";
            }
            break;

        // Kurse
        case 'tbl_kurse':
            if($key == 'kursnummer' && !empty($value) && strlen($value) > 50) {
                return "Kursnummer zu lang: $value";
            }
            if($key == 'kursthema' && !empty($value) && strlen($value) > 100) {
                return "Kursthema zu lang: $value";
            }
            if($key == 'nr_dozent' && !empty($value) && (!is_numeric($value) || intval($value)<=0)) {
                return "Ungültige Dozenten-ID: $value";
            }
            if(in_array($key, ['startdatum','enddatum'])) {
                if(!empty($value)) {
                    $d = DateTime::createFromFormat('Y-m-d', $value);
                    if(!$d || $d->format('Y-m-d') !== $value) {
                        return "Ungültiges Datum $key: $value";
                    }
                }
            }
            if($key == 'dauer' && !empty($value) && (!is_numeric($value) || intval($value)<=0)) {
                return "Ungültige Dauer: $value";
            }
            break;

        // Kurse-Lernende
        case 'tbl_kurse_lernende':
            if($key == 'nr_kurs' || $key == 'nr_lernende') {
                if(!is_numeric($value) || intval($value)<=0) {
                    return "Ungültige ID für $key: $value";
                }
            }
            if($key == 'note' && $value !== null && $value !== "") {
                if(!is_numeric($value) || $value < 1.0 || $value > 6.0) {
                    return "Ungültige Note: $value (1.0–6.0 erlaubt)";
                }
            }
            break;
    }

    return null;
}
?>