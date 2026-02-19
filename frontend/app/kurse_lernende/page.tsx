"use client";
import React, { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

type KurseLernende = {
  id_kurse_lernende?: number;
  nr_kurs?: number | string;
  nr_lernende?: number | string;
  note?: number | string;
  kurs_titel?: string;
  kursnummer?: string;
  lernende_name?: string;
  [key: string]: unknown;
};

export default function KurseLernendePage() {
  const [data, setData] = useState<KurseLernende[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();

  const filteredData = data && searchTerm
    ? data.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  const handleRefresh = () => window.location.reload();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch("http://localhost/kurse_lernende.php?all=true");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        if (!Array.isArray(json)) throw new Error("Unerwartetes Antwortformat");
        setData(json);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Fehler beim Laden");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <div className="button-group">
          <div className="button-group-left">
            <button onClick={() => router.push("/kurse_lernende/create")}>Neuer Eintrag</button>
            <div className="search-container">
              <button className="search-toggle-btn" onClick={() => setSearchOpen(!searchOpen)} title="Suche">
                <Search size={18} />
              </button>
              <div className={`search-bar ${searchOpen ? "open" : ""}`}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Suchen …"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus={searchOpen}
                />
              </div>
            </div>
          </div>
          <button className="refresh-btn" onClick={handleRefresh} title="Seite aktualisieren">
            <RefreshCw size={18} />
          </button>
        </div>

        {loading && <p>Lade Daten …</p>}
        {error && <p>Fehler: {error}</p>}

        <table aria-label="Kurse Lernende Tabelle">
          <thead>
            <tr>
              <th>Kursnummer</th>
              <th>Kurs</th>
              <th>Lernender</th>
              <th>Note</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {!filteredData || filteredData.length === 0 ? (
              <tr>
                <td colSpan={5}>Keine Einträge vorhanden.</td>
              </tr>
            ) : (
              filteredData.map((p, idx) => (
                <tr key={String(p.id_kurse_lernende ?? idx)}>
                  <td>{p.kursnummer ?? "-"}</td>
                  <td>{p.kurs_titel || p.nr_kurs}</td>
                  <td>{p.lernende_name || p.nr_lernende}</td>
                  <td>{p.note ?? "-"}</td>
                  <td>
                    <button onClick={() => router.push(`/kurse_lernende/edit/${p.id_kurse_lernende}`)}>
                      Bearbeiten
                    </button>
                    <button onClick={() => router.push(`/kurse_lernende/delete/${p.id_kurse_lernende}`)}>
                      Löschen
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </>
  );
}