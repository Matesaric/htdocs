# Dokumentation
## Commits
![Committs](./Commits.png)
## Testkonzept – Lernende-Verwaltung
### Testumgebung
| Bereich           | Details                           |
|-------------------|-----------------------------------|
| Betriebssystem    | Windows 11 (64-Bit)               |
| Webserver         | Apache 2.4.58 via XAMPP           |
| PHP               | Version 8.2.12                    |
| Datenbank         | MariaDB 10.4.32 (Host: 127.0.0.1) |
| Relevante Tabelle | tbl_lernende                      |
| Browser           | Google Chrome |
---
### Testdaten
| Feld         | Beispielwert            |
|--------------|-------------------------|
| Vorname      | Elias                   |
| Nachname     | Müller                  |
| Strasse      | Baumstrasse 7           |
| PLZ          | 8882                    |
| Ort          | Unterterzen             |
| Land         | Schweiz                 |
| Geschlecht   | Männlich                |
| Telefon      | 078 136 65 98           |
| Handy        | 079 212 68 17           |
| E-Mail       | elias.mueller@firma.ch  |
| E-Mail privat| elias.mueller@gmail.com |
| Geburtsdatum | 10.08.2009              |
---
### 1. Neuer Lernender hinzufügen
**Ziel:** Ein neuer Lernender wird erfolgreich angelegt und erscheint in der Liste.
| Schritt | Aktion                                 | Erwartetes Ergebnis                                          | Tatsächliches Ergebnis                                       |
|---------|----------------------------------------|--------------------------------------------------------------|--------------------------------------------------------------|
| 1       | Seite "Lernende" öffnen                | Liste der Lernenden wird angezeigt                           | Liste der Lernenden wird angezeigt                           |
| 2       | Button "Neuer Lernender" klicken | Formular öffnet sich                                         | Formular öffnet sich                                         |
| 3       | Alle Daten eingeben     | Eingaben werden übernommen                                   | Eingaben werden übernommen                                   |
| 4       | Speichern klicken                      | Neuer Lernender erscheint mit korrekten Daten in der Tabelle | Neuer Lernender erscheint mit korrekten Daten in der Tabelle |

**Status:** Bestanden

---
### 2. Lernender bearbeiten
**Ziel:** Die Daten eines bestehenden Lernenden werden korrekt geändert und gespeichert.
| Schritt | Aktion                                          | Erwartetes Ergebnis                                    | Tatsächliches Ergebnis                                 |
|---------|-------------------------------------------------|--------------------------------------------------------|--------------------------------------------------------|
| 1       | Auf den Bearbeiten-Button eines Eintrags klicken | Formular öffnet sich mit den bestehenden Daten         | Formular öffnet sich mit den bestehenden Daten         |
| 2       | Einen oder mehrere Werte ändern                 | Eingabe wird im Feld übernommen                        | Eingabe wird im Feld übernommen                        |
| 3       | auf "Speichern" klicken | Geänderter Wert wird korrekt in der Tabelle angezeigt  | Geänderter Wert wird korrekt in der Tabelle angezeigt |

**Status:** Bestanden

---
### 3. Lernender löschen
**Ziel:** Ein Lernender wird erfolgreich gelöscht und erscheint nicht mehr in der Liste.
| Schritt | Aktion                                                  | Erwartetes Ergebnis                        | Tatsächliches Ergebnis                     |
|---------|---------------------------------------------------------|--------------------------------------------|--------------------------------------------|
| 1       | Auf "Löschen" eines Eintrags klicken | Bestätigungsdialog erscheint               | Bestätigungsdialog erscheint               |
| 2       | Löschen bestätigen                                      |Lernender ist nicht mehr in der Tabelle sichtbar | Lernender ist nicht mehr in der Tabelle sichtbar | Lernender ist nicht mehr in der Tabelle sichtbar | Lernender ist nicht mehr in der Tabelle sichtbar |

**Status:** Bestanden

---
### Testergebnis
| Testfall                   | Status |
|----------------------------|--------|
| Neuer Lernender hinzufügen | Bestanden |
| Lernender bearbeiten       | Bestanden |
| Lernender löschen          | Bestanden |
*Alle drei Tests waren erfolgreich. Die Funktionen sind erfolgreich abgenommen.*