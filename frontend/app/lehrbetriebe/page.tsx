"use client";
import React, { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

type Lehrbetrieb = {
  id_lehrbetrieb?: number;
  firma?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  [key: string]: unknown;
};

export default function LehrbetriebePage() {
  const [data, setData] = useState<Lehrbetrieb[] | null>(null);
  const [loading, setLoading] = useState(false);
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
    const load = async () => {
      setLoading(true);
      try {
        const resp = await fetch("http://localhost/lehrbetriebe.php?all=true");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        setData(Array.isArray(json) ? json : []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Fehler beim Laden");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <div className="button-group">
          <div className="button-group-left">
            <button onClick={() => router.push("/lehrbetriebe/create")}>Neuer Lehrbetrieb</button>
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

        {loading && <p>Lade…</p>}
        {error && <p>Fehler: {error}</p>}

        <table>
          <thead>
            <tr>
              <th>Firma</th>
              <th>Strasse</th>
              <th>PLZ</th>
              <th>Ort</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {!filteredData || filteredData.length === 0 ? (
              <tr>
                <td colSpan={5}>Keine Einträge vorhanden.</td>
              </tr>
            ) : (
              filteredData.map((b, i) => (
                <tr key={String(b.id_lehrbetrieb ?? i)}>
                  <td>{b.firma ?? "-"}</td>
                  <td>{b.strasse ?? "-"}</td>
                  <td>{b.plz ?? "-"}</td>
                  <td>{b.ort ?? "-"}</td>
                  <td>
                    <button onClick={() => router.push(`/lehrbetriebe/edit/${b.id_lehrbetrieb ?? b.id}`)}>
                      Bearbeiten
                    </button>
                    <button onClick={() => router.push(`/lehrbetriebe/delete/${b.id_lehrbetrieb ?? b.id}`)}>
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