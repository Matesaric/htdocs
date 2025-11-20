<?php
$mysqli = new mysqli("localhost","root","","Kursverwaltung");
if($mysqli->connect_error){
    die(json_encode(["error"=>"DB-Verbindung fehlgeschlagen: ".$mysqli->connect_error]));
}
?>