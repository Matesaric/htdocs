"use client";
import React, { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";

type KurseLernende = {
  id_kurse_lernende?: number;
  nr_kurs?: number | string;
  nr_lernende?: number | string;
  note?: number | string;
  kurs_titel?: string;
  lernende_name?: string;
};

export default function KurseLernendePage() {
  const [data, setData] = useState<KurseLernende[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<KurseLernende | null>(null);
  const [editForm, setEditForm] = useState<Partial<KurseLernende>>({});
  
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ item: KurseLernende | null; reason?: string } | null>(null);

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
        const resp = await fetch(
          "http://localhost/kurse_lernende.php?all=true"
        );
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        if (!Array.isArray(json)) throw new Error("Unerwartetes Antwortformat");
        setData(json);
      } catch (e: unknown) {
        if (e instanceof Error) setError(e.message);
        else setError("Fehler beim Laden");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openEdit = (p: KurseLernende) => {
    setEditItem(p);
    setEditForm({
      id_kurse_lernende: p.id_kurse_lernende,
      nr_kurs: p.nr_kurs ?? "",
      nr_lernende: p.nr_lernende ?? "",
      note: p.note ?? "",
    });
    setEditOpen(true);
  };

  const handleNew = () => {
    setEditItem(null);
    setEditForm({
      nr_kurs: "",
      nr_lernende: "",
      note: "",
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    const isEdit = !!editItem;

    if (isEdit) {
      const id = editForm.id_kurse_lernende;
      if (!id) {
        alert("Keine gültige ID gefunden – Update unmöglich");
        return;
      }
      setEditOpen(false);
      try {
        const resp = await fetch(
          `http://localhost/kurse_lernende.php?id_kurse_lernende=${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_kurse_lernende: id, ...editForm }),
          }
        );
        const text = await resp.text();
        if (!resp.ok) throw new Error(text);
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
      const resp = await fetch("http://localhost/kurse_lernende.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const text = await resp.text();
      if (!resp.ok) throw new Error(text);
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

  const handleDelete = async (p: KurseLernende) => {
    const id = p.id_kurse_lernende;
    if (!id) return;
    setDeleteConfirm({ item: p });
  };

  const confirmDelete = async () => {
    const p = deleteConfirm?.item;
    if (!p) {
      setDeleteConfirm(null);
      return;
    }
    const id = p.id_kurse_lernende;
    try {
      const resp = await fetch(`http://localhost/kurse_lernende.php?id_kurse_lernende=${id}`, { method: "DELETE" });
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
          <button onClick={handleNew}>Neuer Eintrag</button>
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
            <th>Kurs</th>
            <th>Lernender</th>
            <th>Note</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {!filteredData || filteredData.length === 0 ? (
            <tr>
              <td colSpan={4}>Keine Einträge vorhanden.</td>
            </tr>
          ) : (
            filteredData.map((p, idx) => (
              <tr key={p.id_kurse_lernende ?? idx}>
                <td>{p.kurs_titel || p.nr_kurs}</td>
                <td>{p.lernende_name || p.nr_lernende}</td>
                <td>{p.note ?? "-"}</td>
                <td>
                  <button onClick={() => openEdit(p)}>Bearbeiten</button>
                  <button onClick={() => handleDelete(p)}>Löschen</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {editOpen && (
        <div className="modal-overlay">
          <div className="modal-content" role="dialog" aria-modal="true">
            <h2>{editItem ? "Eintrag bearbeiten" : "Neuer Eintrag"}</h2>

            <div className="form-grid">
              <label>
                Nr. Kurs
                <input
                  value={String(editForm.nr_kurs ?? "")}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      nr_kurs: Number(e.target.value),
                    }))
                  }
                />
              </label>

              <label>
                Nr. Lernende
                <input
                  value={String(editForm.nr_lernende ?? "")}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      nr_lernende: Number(e.target.value),
                    }))
                  }
                />
              </label>

              <label className="full-width">
                Note
                <input
                  type="number"
                  step="0.1"
                  value={editForm.note ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      note: e.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="modal-buttons">
              <button
                onClick={() => {
                  setEditOpen(false);
                  setEditItem(null);
                  setOrigItem(null);
                }}
              >
                Abbrechen
              </button>
              <button onClick={handleSave}>
                {editItem ? "Speichern" : "Erstellen"}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteConfirm?.item && (
        <ConfirmModal
          title="Zuweisung löschen?"
          reason={deleteConfirm.reason ?? null}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={confirmDelete}
        >
          <p>Möchten Sie diese Zuweisung wirklich löschen?</p>
          <div className="delete-info">
            <h4>Zuweisungs-Informationen:</h4>
            <div className="delete-info-field">
              <strong>Kurs:</strong> {deleteConfirm.item.kurs_titel ?? deleteConfirm.item.nr_kurs ?? "-"}
            </div>
            <div className="delete-info-field">
              <strong>Lernender:</strong> {deleteConfirm.item.lernende_name ?? deleteConfirm.item.nr_lernende ?? "-"}
            </div>
            <div className="delete-info-field">
              <strong>ID:</strong> {deleteConfirm.item.id_kurse_lernende ?? deleteConfirm.item.id}
            </div>
          </div>
        </ConfirmModal>
      )}
      </main>
    </>
  );
}