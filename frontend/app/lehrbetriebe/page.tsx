"use client";
import React, { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";

type Lehrbetrieb = {
  id_lehrbetrieb?: number;
  firma?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
};

export default function LehrbetriebePage() {
  const [data, setData] = useState<Lehrbetrieb[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Lehrbetrieb | null>(null);
  const [editForm, setEditForm] = useState<Partial<Lehrbetrieb>>({});
  const [origItem, setOrigItem] = useState<Lehrbetrieb | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ item: Lehrbetrieb | null; reason?: string } | null>(null);

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
    const load = async () => {
      setLoading(true);
      try {
        const resp = await fetch("http://localhost/lehrbetriebe.php?all=true");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        setData(Array.isArray(json) ? json : []);
      } catch (e: any) {
        setError(e?.message ?? "Fehler beim Laden");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openEdit = (item: Lehrbetrieb) => {
    setOrigItem(item);
    setEditItem(item);
    setEditForm({
      id_lehrbetrieb: item.id_lehrbetrieb,
      firma: item.firma ?? "",
      strasse: item.strasse ?? "",
      plz: item.plz ?? "",
      ort: item.ort ?? "",
    });
    setEditOpen(true);
  };

  const handleNew = () => {
    setOrigItem(null);
    setEditItem(null);
    setEditForm({
      firma: "",
      strasse: "",
      plz: "",
      ort: "",
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    const isEdit = !!editItem;

    if (isEdit) {
      const id = editForm.id_lehrbetrieb;
      if (!id) {
        alert("ID fehlt – Update unmöglich");
        return;
      }

      setEditOpen(false);
      try {
        const resp = await fetch(`http://localhost/lehrbetriebe.php?id_lehrbetrieb=${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_lehrbetrieb: id, ...editForm }),
        });
        const text = await resp.text();
        if (!resp.ok) throw new Error(text);
        // Nach erfolgreichem Update neu laden
        handleRefresh();
        return;
      } catch (e: any) {
        alert("Fehler beim Speichern: " + (e?.message ?? e));
      } finally {
        setEditItem(null);
        setOrigItem(null);
      }
      return;
    }

    setEditOpen(false);

    try {
      const resp = await fetch("http://localhost/lehrbetriebe.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const text = await resp.text();
      if (!resp.ok) throw new Error(text);
      // Nach erfolgreichem Erstellen neu laden
      handleRefresh();
      return;
    } catch (e: any) {
      alert("Erstellen fehlgeschlagen: " + (e?.message ?? e));
    }
  };

  const handleDelete = async (item: Lehrbetrieb) => {
    const id = item.id_lehrbetrieb;
    if (!id) return;
    setDeleteConfirm({ item });
  };

  const confirmDelete = async () => {
    const p = deleteConfirm?.item;
    if (!p) {
      setDeleteConfirm(null);
      return;
    }
    const id = p.id_lehrbetrieb;
    try {
      const resp = await fetch(`http://localhost/lehrbetriebe.php?id_lehrbetrieb=${id}`, { method: "DELETE" });
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
          <button onClick={handleNew}>Neuer Lehrbetrieb</button>
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
              <td colSpan={5}>Keine Einträge</td>
            </tr>
          ) : (
            filteredData.map((b, i) => (
              <tr key={b.id_lehrbetrieb ?? i}>
                <td>{b.firma}</td>
                <td>{b.strasse}</td>
                <td>{b.plz}</td>
                <td>{b.ort}</td>
                <td>
                  <button onClick={() => openEdit(b)}>Bearbeiten</button>
                  <button onClick={() => handleDelete(b)}>Löschen</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {editOpen && (
        <div className="modal-overlay">
          <div className="modal-content" role="dialog" aria-modal="true">
            <h2>{editItem ? "Bearbeite Lehrbetrieb" : "Neuer Lehrbetrieb"}</h2>

            <div className="form-grid">
              <label className="full-width">
                Firma
                <input
                  value={editForm.firma ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, firma: e.target.value }))
                  }
                />
              </label>

              <label className="full-width">
                Strasse
                <input
                  value={editForm.strasse ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, strasse: e.target.value }))
                  }
                />
              </label>

              <label>
                PLZ
                <input
                  value={editForm.plz ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, plz: e.target.value }))
                  }
                />
              </label>

              <label>
                Ort
                <input
                  value={editForm.ort ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, ort: e.target.value }))
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
          title="Lehrbetrieb löschen?"
          reason={deleteConfirm.reason ?? null}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={confirmDelete}
        >
          <p>Möchten Sie diesen Lehrbetrieb wirklich löschen?</p>
          <div className="delete-info">
            <h4>Lehrbetrieb-Informationen:</h4>
            <div className="delete-info-field">
              <strong>Firma:</strong> {deleteConfirm.item.firma ?? "-"}
            </div>
            <div className="delete-info-field">
              <strong>ID:</strong> {deleteConfirm.item.id_lehrbetrieb ?? deleteConfirm.item.id}
            </div>
          </div>
        </ConfirmModal>
      )}
      </main>
    </>
  );
}