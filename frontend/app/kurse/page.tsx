"use client";
import React, { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

type Kurs = {
  id_kurs?: number;
  kursnummer?: string;
  kursthema?: string;
  nr_dozent?: number | string;
  startdatum?: string;
  enddatum?: string;
  dauer?: number | string;
  dozent_name?: string;
  [key: string]: unknown;
};


export default function KursePage() {
  const [data, setData] = useState<Kurs[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // router used for navigation when editing
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState(false);
  // navigation used for edit/create/delete pages

  const filteredData = data && searchTerm
    ? data.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  const handleRefresh = () => {
    window.location.reload();
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch("http://localhost/kurse.php?all=true");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        if (!Array.isArray(json)) throw new Error("Unerwartetes Antwortformat");
        setData(json as Kurs[]);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg || "Fehler beim Laden");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNew = () => {
    router.push(`/kurse/create`);
  };

  const handleEdit = (p: Kurs) => {
    const id = p.id_kurs ?? p.id;
    if (id != null) {
      router.push(`/kurse/edit/${id}`);
    }
  };


  const handleDelete = (p: Kurs) => {
    const id = p.id_kurs ?? p.id;
    if (id == null) return;
    router.push(`/kurse/delete/${id}`);
  };


  return (
    <>
      <Navbar />
      <main>

      <div className="button-group">
        <div className="button-group-left">
          <button onClick={handleNew}>Neuer Kurs</button>
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

      <table aria-label="Kurse Tabelle">
        <colgroup>
          <col style={{width: '120px'}} />
          <col style={{width: '150px'}} />
          <col style={{width: '80px'}} />
          <col style={{width: '120px'}} />
          <col style={{width: '120px'}} />
          <col style={{width: '80px'}} />
          <col style={{width: '180px'}} />
        </colgroup>
        <thead>
          <tr>
            <th>Kursnummer</th>
            <th>Kursthema</th>
            <th>Dozent</th>
            <th>Startdatum</th>
            <th>Enddatum</th>
            <th>Dauer</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {!filteredData || filteredData.length === 0 ? (
            <tr>
              <td colSpan={7}>
                Keine Einträge vorhanden.
              </td>
            </tr>
          ) : (
            filteredData.map((k, idx) => (
              <tr key={String(k.id_kurs ?? k.id ?? idx)}>
                <td>{k.kursnummer ?? "-"}</td>
                <td>{k.kursthema ?? "-"}</td>
                <td>{k.dozent_name || k.nr_dozent || "-"}</td>
                <td>{k.startdatum ?? "-"}</td>
                <td>{k.enddatum ?? "-"}</td>
                <td>{k.dauer ?? "-"}</td>
                <td>
                  <button onClick={() => handleEdit(k)}>
                    Bearbeiten
                  </button>
                  <button onClick={() => handleDelete(k)}>
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
