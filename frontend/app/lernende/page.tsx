"use client";
import { useEffect, useState } from "react";

type LernenderBackend = {
  id_lernende: number;
  vorname: string;
  nachname: string;
  geschlecht: "m" | "w" | "d" | null;
  telefon: string | null;
  handy: string | null;
  email: string | null;
};

type Person = {
  id: number;
  vorname: string;
  nachname: string;
  geschlecht: string | null;
  email: string | null;
  telefon: string | null;
  handy: string | null;
};

export default function LernendePage() {
  const [lernende, setLernende] = useState<Person[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch("http://localhost/lernende.php"); // URL anpassen
        const data: LernenderBackend[] = await resp.json();

        const mapped: Person[] = data.map((p) => ({
          id: p.id_lernende,
          vorname: p.vorname,
          nachname: p.nachname,
          geschlecht: p.geschlecht,
          email: p.email,
          telefon: p.telefon,
          handy: p.handy,
        }));

        setLernende(mapped);
      } catch (err) {
        console.error("Fehler beim Laden der Daten:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <main>
      <h1>Willkommen zur Kursverwaltung - Lernende</h1>
      <button onClick={() => history.back()}>Geh zurück</button>

      <table border={1}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Vorname</th>
            <th>Nachname</th>
            <th>Geschlecht</th>
            <th>Email</th>
            <th>Telefon</th>
            <th>Handy</th>
          </tr>
        </thead>
        <tbody>
          {lernende.map((person) => (
            <tr key={person.id}>
              <td>{person.id}</td>
              <td>{person.vorname}</td>
              <td>{person.nachname}</td>
              <td>{person.geschlecht}</td>
              <td>{person.email}</td>
              <td>{person.telefon}</td>
              <td>{person.handy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}