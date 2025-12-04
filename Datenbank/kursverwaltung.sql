-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 04. Dez 2025 um 14:29
-- Server-Version: 10.4.32-MariaDB
-- PHP-Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `kursverwaltung`
--
CREATE DATABASE IF NOT EXISTS `kursverwaltung` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `kursverwaltung`;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tbl_countries`
--

CREATE TABLE `tbl_countries` (
  `id_country` int(11) NOT NULL,
  `country` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `tbl_countries`
--

INSERT INTO `tbl_countries` (`id_country`, `country`) VALUES
(1, 'Schweiz'),
(2, 'Deutschland'),
(3, 'Österreich'),
(4, 'Kroatien'),
(8, 'ww'),
(11, 'Schweiz');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tbl_dozenten`
--

CREATE TABLE `tbl_dozenten` (
  `id_dozent` int(11) NOT NULL,
  `vorname` varchar(50) NOT NULL,
  `nachname` varchar(50) NOT NULL,
  `strasse` varchar(100) DEFAULT NULL,
  `plz` varchar(10) DEFAULT NULL,
  `ort` varchar(100) DEFAULT NULL,
  `nr_land` int(11) DEFAULT NULL,
  `geschlecht` enum('m','w','d') DEFAULT NULL,
  `telefon` varchar(20) DEFAULT NULL,
  `handy` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `birthdate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `tbl_dozenten`
--

INSERT INTO `tbl_dozenten` (`id_dozent`, `vorname`, `nachname`, `strasse`, `plz`, `ort`, `nr_land`, `geschlecht`, `telefon`, `handy`, `email`, `birthdate`) VALUES
(1, 'ABC', 'Schneider', 'Lindenweg 2', '8000', 'Zürich', 1, 'm', '0445556677', '0793334444', 'peter.schneider@schule.ch', '1975-04-10'),
(2, 'Maria', 'Huber', 'Seestrasse 10', '3000', 'Bern', 1, 'w', '0316667788', '0784445556', 'maria.huber@schule.ch', '1980-11-20'),
(4, 'Test', 'XXX', 'XXX 2', '1231', 'XXX', 1, 'm', '786087774', '786087774', 'mate.saric@mail.ch', '2025-11-20'),
(5, 'Test', 'XXX', 'XXX 2', 'dwad', 'XXX', 1, 'm', '786087774', '786087774', 'mate.saric@mail.ch', '2025-11-20'),
(6, 'Test133', 'XXX', 'XXX 2', 'dwad', 'XXX', 1, 'm', '786087774', '786087774', 'mate.saric@mail.ch', '2025-11-20'),
(8, 'coban', 'XXX', 'XXX 2', '1331', '1242xawd', 1, 'm', '786087774', '78607774', 'mate.saric@mail.ch', '2025-11-20'),
(10, 'Test133', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'coban', 'XXX', 'XXX 2', '1331', '1242xawd', 1, 'm', '786087774', '78607774', 'mate.saric@mail.ch', '2025-11-20'),
(12, 'Test133', 'XXX', 'XXX 2', '1331', '1242xawd', 1, 'm', '786087774', '78607774', 'mate.saric@mail.ch', '2025-11-20'),
(14, 'Hans', 'Meier', 'Musterstr. 2', '8001', 'Zürich', 1, 'm', '447654321', '797654321', 'hans.meier@example.com', '1980-05-12'),
(15, 'Hans', 'Meier', 'Musterstr. 2', '8001', 'Zürich', 1, 'm', '447654321', '797654321', 'hans.meier@example.com', '1980-05-12'),
(16, 'Hans', 'Meier', 'Musterstr. 2', '8001', 'Zürich', 1, 'm', '447654321', '797654321', 'hans.meier@example.com', '1980-05-12'),
(17, 'Hans', 'Meier', 'Musterstr. 2', '8001', 'Zürich', 1, 'm', '447654321', '797654321', 'hans.meier@example.com', '1980-05-12'),
(18, 'Hans', 'Meier', 'Musterstr. 2', '8001', 'Zürich', 1, 'm', '447654321', '797654321', 'hans.meier@example.com', '1980-05-12'),
(19, 'Hans', 'Meier', 'Musterstr. 2', '8001', 'Zürich', 1, 'm', '447654321', '797654321', 'hans.meier@example.com', '1980-05-12'),
(20, 'Hans', 'Meier', 'Musterstr. 2', '8001', 'Zürich', 1, 'm', '447654321', '797654321', 'hans.meier@example.com', '1980-05-12'),
(21, 'Hans', 'Meier', 'Musterstr. 2', '8001', 'Zürich', 1, 'm', '447654321', '797654321', 'hans.meier@example.com', '1980-05-12'),
(22, 'Hans', 'Meier', 'Musterstr. 2', '8001', 'Zürich', 1, 'm', '447654321', '797654321', 'hans.meier@example.com', '1980-05-12'),
(23, 'ABC', 'Schneider', 'Lindenweg 2', '8000', 'Zürich', 1, 'm', '445556677', '793334444', 'peter.schneider@schule.ch', '1975-04-10');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tbl_kurse`
--

CREATE TABLE `tbl_kurse` (
  `id_kurs` int(11) NOT NULL,
  `kursnummer` varchar(50) DEFAULT NULL,
  `kursthema` varchar(100) DEFAULT NULL,
  `inhalt` text DEFAULT NULL,
  `nr_dozent` int(11) DEFAULT NULL,
  `startdatum` date DEFAULT NULL,
  `enddatum` date DEFAULT NULL,
  `dauer` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `tbl_kurse`
--

INSERT INTO `tbl_kurse` (`id_kurs`, `kursnummer`, `kursthema`, `inhalt`, `nr_dozent`, `startdatum`, `enddatum`, `dauer`) VALUES
(1, 'K101', 'Programmieren 1', 'Einführung in Python', 1, '2024-01-10', '2024-03-15', 20),
(2, 'K102', 'Buchhaltung', 'Grundlagen der Buchhaltung', 2, '2024-02-01', '2024-04-01', 15);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tbl_kurse_lernende`
--

CREATE TABLE `tbl_kurse_lernende` (
  `id_kurse_lernende` int(11) NOT NULL,
  `nr_kurs` int(11) NOT NULL,
  `nr_lernende` int(11) NOT NULL,
  `note` decimal(3,1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `tbl_kurse_lernende`
--

INSERT INTO `tbl_kurse_lernende` (`id_kurse_lernende`, `nr_kurs`, `nr_lernende`, `note`) VALUES
(9, 1, 71, 5.5),
(10, 1, 72, 5.0),
(11, 1, 73, 4.8),
(12, 2, 74, 5.2),
(13, 2, 75, 4.9),
(14, 1, 82, 4.7),
(51, 1, 82, 4.5),
(52, 1, 82, 4.5),
(53, 1, 82, 4.5);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tbl_lehrbetriebe`
--

CREATE TABLE `tbl_lehrbetriebe` (
  `id_lehrbetrieb` int(11) NOT NULL,
  `firma` varchar(100) NOT NULL,
  `strasse` varchar(100) DEFAULT NULL,
  `plz` varchar(10) DEFAULT NULL,
  `ort` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `tbl_lehrbetriebe`
--

INSERT INTO `tbl_lehrbetriebe` (`id_lehrbetrieb`, `firma`, `strasse`, `plz`, `ort`) VALUES
(1, 'Musterfirma AG', 'Hauptstrasse 1', '8000', 'Zürich'),
(5, 'Tech Solutions AG', 'Industriestrasse 1', '8000', 'Zürich'),
(6, 'Test', 'Test', '1234', 'Test'),
(9, 'string', 'string', '8877', 'string'),
(10, 'Musterfirma AG', 'Musterstrasse 1', '8000', 'Zürich'),
(11, 'Musterfirma AG', 'Musterstrasse 1', '8000', 'Zürich'),
(12, 'Musterfirma AG', 'Musterstrasse 1', '8000', 'Zürich'),
(13, 'Musterfirma AG', 'Musterstrasse 1', '8000', 'Zürich'),
(14, 'Musterfirma AG', 'Musterstrasse 1', '8000', 'Zürich'),
(15, 'Musterfirma AG', 'Musterstrasse 1', '8000', 'Zürich'),
(16, 'Musterfirma AG', 'Musterstrasse 1', '8000', 'X'),
(17, 'Musterfirma AG', 'Musterstrasse 1', '8000', 'X'),
(18, 'Musterfirma AG', 'Musterstrasse 1', '8000', 'X'),
(21, 'Musterfirma AG', 'Hauptstrasse 1', '8000', 'Zürich');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tbl_lehrbetriebe_lernende`
--

CREATE TABLE `tbl_lehrbetriebe_lernende` (
  `id_lehrbetriebe_lernende` int(11) NOT NULL,
  `nr_lehrbetrieb` int(11) NOT NULL,
  `nr_lernende` int(11) NOT NULL,
  `start` date DEFAULT NULL,
  `ende` date DEFAULT NULL,
  `beruf` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `tbl_lehrbetriebe_lernende`
--

INSERT INTO `tbl_lehrbetriebe_lernende` (`id_lehrbetriebe_lernende`, `nr_lehrbetrieb`, `nr_lernende`, `start`, `ende`, `beruf`) VALUES
(5, 1, 72, '2023-08-01', '2025-07-31', 'Logistiker'),
(10, 1, 80, '2024-08-01', '2025-07-31', 'DADDW'),
(18, 1, 58, '2025-03-01', '2025-12-31', 'Informatiker');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tbl_lernende`
--

CREATE TABLE `tbl_lernende` (
  `id_lernende` int(11) NOT NULL,
  `vorname` varchar(50) NOT NULL,
  `nachname` varchar(50) NOT NULL,
  `strasse` varchar(100) DEFAULT NULL,
  `plz` varchar(10) DEFAULT NULL,
  `ort` varchar(100) DEFAULT NULL,
  `nr_land` int(11) DEFAULT NULL,
  `geschlecht` enum('m','w','d') DEFAULT NULL,
  `telefon` varchar(20) DEFAULT NULL,
  `handy` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `email_privat` varchar(100) DEFAULT NULL,
  `birthdate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `tbl_lernende`
--

INSERT INTO `tbl_lernende` (`id_lernende`, `vorname`, `nachname`, `strasse`, `plz`, `ort`, `nr_land`, `geschlecht`, `telefon`, `handy`, `email`, `email_privat`, `birthdate`) VALUES
(49, 'Lukas', 'Müller', 'Bahnhofstrasse 12', '8001', 'Zürich', NULL, 'm', '0441234567', '0791234567', 'lukas.mueller@schule.ch', 'lukas.mueller@gmail.com', '2003-05-14'),
(52, 'TEST', 'Schmid', 'Bergstrasse 4', '9000', 'St. Gallen', NULL, 'w', '0715556677', '0762223344', 'sophie.schmid@schule.ch', 'sophie.schmid@gmail.com', '2003-03-18'),
(53, 'Noah', 'Huber', 'Wiesenweg 10', '6003', 'Luzern', NULL, 'm', '0418889999', '0775556667', 'noah.huber@schule.ch', 'noah.huber@gmail.com', '2005-07-25'),
(54, 'Lea', 'Baumann', 'Seestrasse 21', '8702', 'Zollikon', NULL, 'w', '0445566777', '0799988776', 'lea.baumann@schule.ch', 'lea.baumann@hotmail.com', '2003-12-02'),
(55, 'Jonas', 'Fischer', 'Kirchweg 8', '5000', 'Aarau', NULL, 'm', '0621112233', '0767778889', 'jonas.fischer@schule.ch', 'jonas.fischer@gmail.com', '2004-10-09'),
(57, 'David', 'Kunz', 'Industriestrasse 5', '6300', 'Zug', NULL, 'm', '0417778889', '0781112223', 'david.kunz@schule.ch', 'david.kunz@gmail.com', '2002-02-19'),
(58, 'Nina', 'Steiner', 'Lindenweg 17', '5400', 'Baden', NULL, 'w', '0566667777', '0795556666', 'nina.steiner@schule.ch', 'nina.steiner@yahoo.com', '2004-08-12'),
(59, 'Tim', 'Graf', 'Birkenweg 2', '8500', 'Frauenfeld', NULL, 'm', '0528889990', '0774445556', 'tim.graf@schule.ch', 'tim.graf@web.de', '2003-11-27'),
(60, 'Julia', 'Kälin', 'Obere Gasse 14', '6430', 'Schwyz', NULL, 'w', '0414445556', '0782223334', 'julia.kaelin@schule.ch', 'julia.kaelin@gmail.com', '2005-05-30'),
(61, 'Simon', 'Schneider', 'Dorfstrasse 3', '3800', 'Interlaken', NULL, 'm', '0333334445', '0791112224', 'simon.schneider@schule.ch', 'simon.schneider@gmail.com', '2002-04-05'),
(62, 'Mia', 'Vogel', 'Bachstrasse 11', '3600', 'Thun', NULL, 'w', '0335556667', '0789990001', 'mia.vogel@schule.ch', 'mia.vogel@hotmail.com', '2004-01-28'),
(63, 'Leon', 'Zimmermann', 'Waldweg 18', '2500', 'Biel', NULL, 'm', '0328887776', '0765554443', 'leon.zimmermann@schule.ch', 'leon.zimmermann@gmail.com', '2003-09-10'),
(64, 'Sarah', 'Ammann', 'Sonnenweg 7', '7004', 'Chur', NULL, 'w', '0815554443', '0792221110', 'sarah.ammann@schule.ch', 'sarah.ammann@gmail.com', '2002-07-19'),
(66, 'Laura', 'Egger', 'Tannenweg 22', '8400', 'Winterthur', NULL, 'w', '0526665554', '0799998887', 'laura.egger@schule.ch', 'laura.egger@gmail.com', '2005-10-22'),
(67, 'Philipp', 'Hofer', 'Rainstrasse 9', '6005', 'Luzern', NULL, 'm', '0416665553', '0781234567', 'philipp.hofer@schule.ch', 'philipp.hofer@gmail.com', '2003-04-12'),
(68, 'Selina', 'Wyss', 'Talstrasse 5', '5001', 'Aarau', NULL, 'w', '0625554443', '0792345678', 'selina.wyss@schule.ch', 'selina.wyss@hotmail.com', '2004-06-08'),
(69, 'Marco', 'Frei', 'Hinterweg 15', '3007', 'Bern', NULL, 'm', '0317776665', '0783456789', 'marco.frei@schule.ch', 'marco.frei@gmail.com', '2002-12-24'),
(70, 'Elena', 'Schäfer', 'Alpenblick 2', '1003', 'Lausanne', NULL, 'w', '0215554443', '0799876543', 'elena.schaefer@schule.ch', 'elena.schaefer@gmail.com', '2004-09-03'),
(71, 'Tobias', 'Roth', 'Gartenweg 6', '8105', 'Regensdorf', NULL, 'm', '0449998887', '0784567890', 'tobias.roth@schule.ch', 'tobias.roth@gmail.com', '2003-03-09'),
(72, 'Celine', 'Marti', 'Buchenweg 8', '4410', 'Liestal', NULL, 'w', '0618887776', '0795678901', 'celine.marti@schule.ch', 'celine.marti@outlook.com', '2004-05-16'),
(73, 'Ramon', 'Ziegler', 'Blumenweg 12', '8050', 'Zürich', NULL, 'm', '0445554443', '0796789012', 'ramon.ziegler@schule.ch', 'ramon.ziegler@gmail.com', '2002-11-01'),
(74, 'XSophie', 'XSchmid', 'XBergstrasse 4', '9000', 'XSt. Gallen', NULL, 'w', '0715556677', '0762223344', 'Xsophie.schmid@schule.ch', 'Xsophie.schmid@gmail.com', '2003-03-18'),
(75, 'XSophie', 'XSchmid', 'XBergstrasse 4', '9000', 'XSt. Gallen', NULL, 'w', '0715556677', '0762223344', 'Xsophie.schmid@schule.ch', 'Xsophie.schmid@gmail.com', '2003-03-18'),
(76, 'TEST', 'XSchmid', 'XBergstrasse 4', '9000', 'XSt. Gallen', NULL, 'w', '0715556677', '0762223344', 'Xsophie.schmid@schule.ch', 'Xsophie.schmid@gmail.com', '2003-03-18'),
(77, 'TEST', 'XSchmid', 'XBergstrasse 4', '9000', 'XSt. Gallen', NULL, 'w', '0715556677', '0762223344', 'Xsophie.schmid@schule.ch', 'Xsophie.schmid@gmail.com', '2003-03-18'),
(78, 'TEST', 'TEST1', 'test123', '8877', 'TEST', NULL, 'm', '786087774', '786087774', 'mate.saric@mail.ch', 'mate.saric@mail.ch', '2025-10-01'),
(79, 'Mate', 'Saric', 'Baumgartenstrasse 3', '8877', 'Murg', NULL, 'm', '0786087774', '0786087774', 'mate.saric@mail.ch', 'mate.saric@mail.ch', '2008-10-01'),
(80, 'Lukas', 'Müller', 'Bahnhofstrasse 12', '8001', 'Zürich', 1, 'm', '0441234567', '0791234567', 'lukas.mueller@schule.ch', 'lukas.mueller@gmail.com', '2003-05-14'),
(81, 'Anna', 'Meier', 'Hauptstrasse 7', '3000', 'Bern', 1, 'w', '0312234567', '0787654321', 'anna.meier@schule.ch', 'anna.meier@yahoo.com', '2004-09-22'),
(82, 'Jan', 'Keller', 'Postweg 9', 'xxx', 'Basel', 1, 'm', '619876543', '791112233', 'jan.keller@schule.ch', 'jan.keller@hotmail.com', '2002-01-11'),
(83, 'Mate', 'Saric', 'Baumgartenstrasse 3', '8877', 'Murg', 1, 'w', '0786087774', '0786087774', 'mate.saric@mail.ch', 'mate.saric@mail.ch', '2008-10-01'),
(84, 'Mate', 'Saric', 'Baumgartenstrasse 3', '8877', 'Murg', 1, 'w', '0786087774', '0786087774', 'mate.saric@mail.ch', 'mate.saric@mail.ch', '2008-10-01'),
(86, 'Mate', 'Saric', 'Baumgartenstrasse 3', '8877', 'Murg', 1, 'w', '0786087774', '0786087774', 'mate.saric@mail.ch', 'mate.saric@mail.ch', '2008-10-01'),
(87, 'Mate', 'Saric', 'Baumgartenstrasse 3', '8888', 'Murg', 1, 'm', '0787654321', '0787654321', 'mate.saric@mail.ch', 'mate.saric@mail.ch', '2008-10-01'),
(88, 'Lukas', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(89, 'Lukas', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(90, 'Lukas', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(91, 'Lukas', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(92, 'Lukas', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(93, 'Lukas', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(94, 'Lukas', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(95, 'Lukas', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(96, 'Fabian', 'Bucher', 'Rosenweg 19', '8313', 'Lenzburg', 1, 'd', '0312234567', '0312234567', 'fabian.bucher@outlook.com', 'fabian.bucher@outlook.com', '2003-02-15');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `tbl_countries`
--
ALTER TABLE `tbl_countries`
  ADD PRIMARY KEY (`id_country`);

--
-- Indizes für die Tabelle `tbl_dozenten`
--
ALTER TABLE `tbl_dozenten`
  ADD PRIMARY KEY (`id_dozent`),
  ADD KEY `nr_land` (`nr_land`);

--
-- Indizes für die Tabelle `tbl_kurse`
--
ALTER TABLE `tbl_kurse`
  ADD PRIMARY KEY (`id_kurs`),
  ADD KEY `nr_dozent` (`nr_dozent`);

--
-- Indizes für die Tabelle `tbl_kurse_lernende`
--
ALTER TABLE `tbl_kurse_lernende`
  ADD PRIMARY KEY (`id_kurse_lernende`),
  ADD KEY `nr_kurs` (`nr_kurs`),
  ADD KEY `nr_lernende` (`nr_lernende`);

--
-- Indizes für die Tabelle `tbl_lehrbetriebe`
--
ALTER TABLE `tbl_lehrbetriebe`
  ADD PRIMARY KEY (`id_lehrbetrieb`);

--
-- Indizes für die Tabelle `tbl_lehrbetriebe_lernende`
--
ALTER TABLE `tbl_lehrbetriebe_lernende`
  ADD PRIMARY KEY (`id_lehrbetriebe_lernende`),
  ADD KEY `nr_lehrbetrieb` (`nr_lehrbetrieb`),
  ADD KEY `nr_lernende` (`nr_lernende`);

--
-- Indizes für die Tabelle `tbl_lernende`
--
ALTER TABLE `tbl_lernende`
  ADD PRIMARY KEY (`id_lernende`),
  ADD KEY `nr_land` (`nr_land`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `tbl_countries`
--
ALTER TABLE `tbl_countries`
  MODIFY `id_country` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT für Tabelle `tbl_dozenten`
--
ALTER TABLE `tbl_dozenten`
  MODIFY `id_dozent` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT für Tabelle `tbl_kurse`
--
ALTER TABLE `tbl_kurse`
  MODIFY `id_kurs` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT für Tabelle `tbl_kurse_lernende`
--
ALTER TABLE `tbl_kurse_lernende`
  MODIFY `id_kurse_lernende` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT für Tabelle `tbl_lehrbetriebe`
--
ALTER TABLE `tbl_lehrbetriebe`
  MODIFY `id_lehrbetrieb` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT für Tabelle `tbl_lehrbetriebe_lernende`
--
ALTER TABLE `tbl_lehrbetriebe_lernende`
  MODIFY `id_lehrbetriebe_lernende` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT für Tabelle `tbl_lernende`
--
ALTER TABLE `tbl_lernende`
  MODIFY `id_lernende` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `tbl_dozenten`
--
ALTER TABLE `tbl_dozenten`
  ADD CONSTRAINT `tbl_dozenten_ibfk_1` FOREIGN KEY (`nr_land`) REFERENCES `tbl_countries` (`id_country`);

--
-- Constraints der Tabelle `tbl_kurse`
--
ALTER TABLE `tbl_kurse`
  ADD CONSTRAINT `tbl_kurse_ibfk_1` FOREIGN KEY (`nr_dozent`) REFERENCES `tbl_dozenten` (`id_dozent`);

--
-- Constraints der Tabelle `tbl_kurse_lernende`
--
ALTER TABLE `tbl_kurse_lernende`
  ADD CONSTRAINT `tbl_kurse_lernende_ibfk_1` FOREIGN KEY (`nr_kurs`) REFERENCES `tbl_kurse` (`id_kurs`),
  ADD CONSTRAINT `tbl_kurse_lernende_ibfk_2` FOREIGN KEY (`nr_lernende`) REFERENCES `tbl_lernende` (`id_lernende`);

--
-- Constraints der Tabelle `tbl_lehrbetriebe_lernende`
--
ALTER TABLE `tbl_lehrbetriebe_lernende`
  ADD CONSTRAINT `tbl_lehrbetriebe_lernende_ibfk_1` FOREIGN KEY (`nr_lehrbetrieb`) REFERENCES `tbl_lehrbetriebe` (`id_lehrbetrieb`),
  ADD CONSTRAINT `tbl_lehrbetriebe_lernende_ibfk_2` FOREIGN KEY (`nr_lernende`) REFERENCES `tbl_lernende` (`id_lernende`);

--
-- Constraints der Tabelle `tbl_lernende`
--
ALTER TABLE `tbl_lernende`
  ADD CONSTRAINT `tbl_lernende_ibfk_1` FOREIGN KEY (`nr_land`) REFERENCES `tbl_countries` (`id_country`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
