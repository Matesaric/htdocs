"use client";
import React, { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import Navbar from "../components/Navbar";

type Country = {
  id_country?: number;
  country?: string;
  [key: string]: any;
};

export default function CountriesPage() {
  const [data, setData] = useState<Country[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Country | null>(null);
  const [editForm, setEditForm] = useState<Partial<Country>>({});
  const [origItem, setOrigItem] = useState<Country | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState(false);

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
        const resp = await fetch("http://localhost/laender.php?all=true");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        if (!Array.isArray(json)) throw new Error("Unerwartetes Antwortformat");
        setData(json as Country[]);
      } catch (e: any) {
        setError(e?.message ?? "Fehler beim Laden");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openEdit = (p: Country) => {
    setOrigItem(p);
    setEditItem(p);
    setEditForm({
      id_country: p.id_country,
      country: p.country ?? "",
    });
    setEditOpen(true);
  };

  const handleNew = () => {
    setOrigItem(null);
    setEditItem(null);
    setEditForm({
      country: "",
    });
    setEditOpen(true);
  };

  const handleEdit = (p: Country) => openEdit(p);

  const handleSave = async () => {
    const isEdit = !!editItem;

    if (isEdit) {
      const idRaw = editForm.id_country ?? editItem!.id_country ?? editItem!.id;
      if (idRaw == null || String(idRaw).trim() === "") {
        alert("Keine gültige ID gefunden – Update unmöglich");
        return;
      }
      const id = Number(idRaw);
      const previousCountry = origItem;

      setData((currentData) =>
        currentData
          ? currentData.map((item) =>
              String(item.id_country ?? item.id) === String(id)
                ? { ...item, ...editForm, id_country: id }
                : item
            )
          : currentData
      );

      setEditOpen(false);

      try {
        const payload = {
          id_country: id,
          ...editForm,
        };
        console.log("Sende PUT-Request mit:", payload);
        
        const resp = await fetch(`http://localhost/laender.php?id_country=${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const text = await resp.text();
        console.log("Response Status:", resp.status, "Response Text:", text);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text}`);
      } catch (e: any) {
        alert("Fehler beim Speichern: " + (e?.message ?? e));

        if (previousCountry) {
          const previousId = String(previousCountry.id_country ?? previousCountry.id ?? "");
          setData((currentData) =>
            currentData
              ? currentData.map((item) =>
                  String(item.id_country ?? item.id ?? "") === previousId ? previousCountry : item
                )
              : currentData
          );
        }
      } finally {
        setEditItem(null);
        setOrigItem(null);
      }

      return;
    }

    setEditOpen(false);

    try {
      console.log("Sende POST-Request mit:", editForm);
      
      const resp = await fetch("http://localhost/laender.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const text = await resp.text();
      console.log("Response Status:", resp.status, "Response Text:", text);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text}`);

      let createdId: number | undefined;
      try {
        const j = JSON.parse(text);
        createdId = j?.id_country;
      } catch {}

      const createdRow: Country = {
        ...(editForm as Country),
        ...(createdId != null ? { id_country: createdId } : {}),
      };

      setData((currentData) => (currentData ? [createdRow, ...currentData] : [createdRow]));
    } catch (e: any) {
      alert("Erstellen fehlgeschlagen: " + (e?.message ?? e));
    } finally {
      setEditItem(null);
      setOrigItem(null);
    }
  };

  const handleDelete = async (p: Country) => {
    const idRaw = p.id_country ?? p.id;
    if (idRaw == null || String(idRaw).trim() === "") {
      alert("Keine gültige ID gefunden – Löschen unmöglich");
      return;
    }

    const idStr = String(idRaw);

    if (!confirm(`Löschen bestätigen für ID: ${idStr}?`)) return;

    let removedCountry: Country | null = null;

    setData((previousData) => {
      if (!previousData) return previousData;
      const filteredData = previousData.filter((item) => {
        const itemId = String(item.id_country ?? item.id ?? "");
        if (itemId === idStr) {
          removedCountry = item;
          return false;
        }
        return true;
      });
      return filteredData;
    });

    try {
      const resp = await fetch(
        `http://localhost/laender.php?id_country=${idStr}`,
        { method: "DELETE" }
      );

      const text = await resp.text();
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text}`);
    } catch (e: any) {
      alert("Löschen fehlgeschlagen: " + (e?.message ?? e));

      if (removedCountry) {
        setData((previousData) => (previousData ? [removedCountry!, ...previousData] : [removedCountry!]));
      }
    }
  };

  return (
    <>
      <Navbar />
      <main>

      <div className="button-group">
        <div className="button-group-left">
          <button onClick={handleNew}>Neues Land</button>
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
              <td colSpan={2}>
                Keine Einträge vorhanden.
              </td>
            </tr>
          ) : (
            filteredData.map((c, idx) => (
              <tr key={c.id_country ?? c.id ?? idx}>
                <td>{c.country ?? "-"}</td>
                <td>
                  <button onClick={() => handleEdit(c)}>
                    Bearbeiten
                  </button>
                  <button onClick={() => handleDelete(c)}>
                    Löschen
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {editOpen && (
        <div className="modal-overlay">
          <div className="modal-content" role="dialog" aria-modal="true">
            <h2>{editItem ? "Bearbeite Land" : "Neues Land"}</h2>

            <div className="form-grid">
              <label className="full-width">
                Landname
                <input value={(editForm.country as string) || ""} onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))} />
              </label>
            </div>

            <div className="modal-buttons">
              <button onClick={() => { setEditOpen(false); setEditItem(null); setOrigItem(null); }}>
                Abbrechen
              </button>
              <button onClick={handleSave}>{editItem ? "Speichern" : "Erstellen"}</button>
            </div>
          </div>
        </div>
      )}
      </main>
    </>
  );
}
