"use client";
import React, { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

type Lernender = {
  id_lernende?: number;
  vorname?: string;
  nachname?: string;
  ort?: string;
  nr_land?: number | string;
  geschlecht?: string;
  email?: string;
  email_privat?: string;
  land_name?: string;
  [key: string]: unknown;
};

const genderLabel = (g?: string) => {
  if (!g) return "-";
  const s = String(g).toLowerCase();
  if (s === "m") return "Männlich";
  if (s === "w") return "Weiblich";
  if (s === "d") return "Divers";
  return g;
};

export default function LernendePage() {
  const [data, setData] = useState<Lernender[] | null>(null);
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
        const resp = await fetch("http://localhost/lernende.php?all=true");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        if (!Array.isArray(json)) throw new Error("Unerwartetes Antwortformat");
        setData(json as Lernender[]);
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
            <button onClick={() => router.push("/lernende/create")}>Neuer Lernender</button>
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

        <table aria-label="Lernende Tabelle">
          <thead>
            <tr>
              <th>Vorname</th>
              <th>Nachname</th>
              <th>Land</th>
              <th>Geschlecht</th>
              <th>E-Mail</th>
              <th>Ort</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {!filteredData || filteredData.length === 0 ? (
              <tr>
                <td colSpan={7}>Keine Einträge vorhanden.</td>
              </tr>
            ) : (
              filteredData.map((p, idx) => (
                <tr key={String(p.id_lernende ?? p.id ?? idx)}>
                  <td>{p.vorname ?? "-"}</td>
                  <td>{p.nachname ?? "-"}</td>
                  <td>{p.land_name ?? p.nr_land ?? "-"}</td>
                  <td>{genderLabel(p.geschlecht)}</td>
                  <td>{p.email ?? p.email_privat ?? "-"}</td>
                  <td>{p.ort ?? "-"}</td>
                  <td>
                    <button onClick={() => router.push(`/lernende/edit/${p.id_lernende ?? p.id}`)}>
                      Bearbeiten
                    </button>
                    <button onClick={() => router.push(`/lernende/delete/${p.id_lernende ?? p.id}`)}>
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