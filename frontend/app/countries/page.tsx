"use client";
import React, { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

type Country = {
  id_country?: number;
  country?: string;
  [key: string]: unknown;
};

export default function LaenderPage() {
  const [data, setData] = useState<Country[] | null>(null);
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
        const resp = await fetch("http://localhost/laender.php?all=true");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        if (!Array.isArray(json)) throw new Error("Unerwartetes Antwortformat");
        setData(json as Country[]);
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
            <button onClick={() => router.push("/countries/create")}>Neues Land</button>
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

        <table aria-label="Länder Tabelle">
          <thead>
            <tr>
              <th>Land</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {!filteredData || filteredData.length === 0 ? (
              <tr>
                <td colSpan={2}>Keine Einträge vorhanden.</td>
              </tr>
            ) : (
              filteredData.map((c, idx) => (
                <tr key={String(c.id_country ?? c.id ?? idx)}>
                  <td>{c.country ?? "-"}</td>
                  <td>
                    <button onClick={() => router.push(`/countries/edit/${c.id_country ?? c.id}`)}>
                      Bearbeiten
                    </button>
                    <button onClick={() => router.push(`/countries/delete/${c.id_country ?? c.id}`)}>
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