"use client";
import React, { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";

// Datentyp für Länder, unverändert von API zurückgegeben
// Zusätzliche Felder werden durch den Index-Typ abgefangen

type Country = {
  id_country?: number;
  country?: string;
  [key: string]: any;
};

export default function CountriesPage() {
  // Grundzustände und UI-Flags für die Länderverwaltung
  const [data, setData] = useState<Country[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Country | null>(null);
  const [editForm, setEditForm] = useState<Partial<Country>>({});
  
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ item: Country | null; reason?: string } | null>(null);

  // Filtert Länder nach Suchbegriff über alle Felder
  const filteredData = data && searchTerm
    ? data.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  // Hilfsfunktion zum vollständigen Neuladen der Seite
  const handleRefresh = () => {
    window.location.reload();
  };

  // Beim ersten Rendern Daten vom Server laden
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

  // Formular mit den Werten eines bestehenden Landes füllen
  const openEdit = (p: Country) => {
    setEditItem(p);
    setEditForm({
      id_country: p.id_country,
      country: p.country ?? "",
    });
    setEditOpen(true);
  };

  // Bereite leeres Formular für ein neues Land vor
  const handleNew = () => {
    setEditItem(null);
    setEditForm({
      country: "",
    });
    setEditOpen(true);
  };

  const handleEdit = (p: Country) => openEdit(p);

  // Speichern: Unterscheidung zwischen Bearbeiten und Erstellen
  const handleSave = async () => {
    const isEdit = !!editItem;

    if (isEdit) {
      const idRaw = editForm.id_country ?? editItem!.id_country ?? editItem!.id;
      if (idRaw == null || String(idRaw).trim() === "") {
        alert("Keine gültige ID gefunden – Update unmöglich");
        return;
      }
      const id = Number(idRaw);
      setEditOpen(false);
      try {
        const payload = { id_country: id, ...editForm };
        console.log("Sende PUT-Request mit:", payload);
        const resp = await fetch(`http://localhost/laender.php?id_country=${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const text = await resp.text();
        console.log("Response Status:", resp.status, "Response Text:", text);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text}`);
        // Nach erfolgreichem Update neu laden
        handleRefresh();
        return;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        alert("Fehler beim Speichern: " + msg);
      } finally {
        setEditItem(null);
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
      // Nach erfolgreichem Erstellen neu laden
      handleRefresh();
      return;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      alert("Erstellen fehlgeschlagen: " + msg);
    } finally {
      setEditItem(null);
    }
  };

  // Benutzer hat Löschen angeklickt, öffne Bestätigungsdialog
  const handleDelete = async (p: Country) => {
    const idRaw = p.id_country ?? p.id;
    if (idRaw == null || String(idRaw).trim() === "") {
      alert("Keine gültige ID gefunden – Löschen unmöglich");
      return;
    }
    setDeleteConfirm({ item: p });
  };

  const confirmDelete = async () => {
    const p = deleteConfirm?.item;
    if (!p) {
      setDeleteConfirm(null);
      return;
    }
    const idRaw = p.id_country ?? p.id;
    const idStr = String(idRaw);
    try {
      const resp = await fetch(`http://localhost/laender.php?id_country=${idStr}`, { method: "DELETE" });
      const text = await resp.text();
      if (!resp.ok) throw new Error(text);
      setDeleteConfirm(null);
      handleRefresh();
      return;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setDeleteConfirm({ item: p, reason: msg });
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
      {deleteConfirm?.item && (
        <ConfirmModal
          title="Land löschen?"
          reason={deleteConfirm.reason ?? null}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={confirmDelete}
        >
          <p>Möchten Sie dieses Land wirklich löschen?</p>
          <div className="delete-info">
            <h4>Land-Informationen:</h4>
            <div className="delete-info-field">
              <strong>Land:</strong> {deleteConfirm.item.country ?? "-"}
            </div>
            <div className="delete-info-field">
              <strong>ID:</strong> {deleteConfirm.item.id_country ?? deleteConfirm.item.id}
            </div>
          </div>
        </ConfirmModal>
      )}
      </main>
    </>
  );
}
