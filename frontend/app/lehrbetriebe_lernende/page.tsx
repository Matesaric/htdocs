"use client";
import React, { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import Navbar from "../components/Navbar";

type LehrbetriebLernende = {
  id_lehrbetriebe_lernende?: number;
  nr_lehrbetrieb?: number | string;
  nr_lernende?: number | string;
  start?: string;
  ende?: string;
  beruf?: string;
  lehrbetrieb_name?: string;
  lernende_name?: string;
};

export default function LehrbetriebLernendePage() {
  const [data, setData] = useState<LehrbetriebLernende[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<LehrbetriebLernende | null>(null);
  const [editForm, setEditForm] = useState<Partial<LehrbetriebLernende>>({});
  const [origItem, setOrigItem] = useState<LehrbetriebLernende | null>(null);
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
        const resp = await fetch(
          "http://localhost/lehrbetrieb_lernende.php?all=true"
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

  const openEdit = (p: LehrbetriebLernende) => {
    setOrigItem(p);
    setEditItem(p);
    setEditForm({
      id_lehrbetriebe_lernende: p.id_lehrbetriebe_lernende,
      nr_lehrbetrieb: p.nr_lehrbetrieb ?? "",
      nr_lernende: p.nr_lernende ?? "",
      start: p.start ?? "",
      ende: p.ende ?? "",
      beruf: p.beruf ?? "",
    });
    setEditOpen(true);
  };

  const handleNew = () => {
    setOrigItem(null);
    setEditItem(null);
    setEditForm({
      nr_lehrbetrieb: "",
      nr_lernende: "",
      start: "",
      ende: "",
      beruf: "",
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    const isEdit = !!editItem;

    if (isEdit) {
      const id = editForm.id_lehrbetriebe_lernende;
      if (!id) {
        alert("Keine gültige ID gefunden – Update unmöglich");
        return;
      }

      const previous = origItem;

      setData((current) =>
        current
          ? current.map((item) =>
              item.id_lehrbetriebe_lernende === id
                ? { ...item, ...editForm }
                : item
            )
          : current
      );

      setEditOpen(false);

      try {
        const resp = await fetch(
          `http://localhost/lehrbetrieb_lernende.php?id_lehrbetriebe_lernende=${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_lehrbetriebe_lernende: id,
              ...editForm,
            }),
          }
        );

        const text = await resp.text();
        if (!resp.ok) throw new Error(text);
      } catch (e: unknown) {
        alert("Fehler beim Speichern");
        if (previous) {
          setData((current) =>
            current
              ? current.map((item) =>
                  item.id_lehrbetriebe_lernende ===
                  previous.id_lehrbetriebe_lernende
                    ? previous
                    : item
                )
              : current
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
      const resp = await fetch(
        "http://localhost/lehrbetrieb_lernende.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        }
      );

      const text = await resp.text();
      if (!resp.ok) throw new Error(text);

      let createdId: number | undefined;
      try {
        createdId = JSON.parse(text)?.id_lehrbetriebe_lernende;
      } catch {}

      const newRow: LehrbetriebLernende = {
        ...(editForm as LehrbetriebLernende),
        ...(createdId ? { id_lehrbetriebe_lernende: createdId } : {}),
      };

      setData((current) =>
        current ? [newRow, ...current] : [newRow]
      );
    } catch {
      alert("Erstellen fehlgeschlagen");
    } finally {
      setEditItem(null);
      setOrigItem(null);
    }
  };

  const handleDelete = async (p: LehrbetriebLernende) => {
    const id = p.id_lehrbetriebe_lernende;
    if (!id) return;

    if (!confirm(`Löschen bestätigen für ID: ${id}?`)) return;

    let removed: LehrbetriebLernende | null = null;

    setData((prev) => {
      if (!prev) return prev;
      return prev.filter((item) => {
        if (item.id_lehrbetriebe_lernende === id) {
          removed = item;
          return false;
        }
        return true;
      });
    });

    try {
      await fetch(
        `http://localhost/lehrbetrieb_lernende.php?id_lehrbetriebe_lernende=${id}`,
        { method: "DELETE" }
      );
    } catch {
      if (removed) {
        setData((prev) =>
          prev ? [removed!, ...prev] : [removed!]
        );
      }
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

      <table aria-label="Lehrbetrieb Lernende Tabelle">
        <thead>
          <tr>
            <th>Lehrbetrieb</th>
            <th>Lernender</th>
            <th>Start</th>
            <th>Ende</th>
            <th>Beruf</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {!filteredData || filteredData.length === 0 ? (
            <tr>
              <td colSpan={6}>Keine Einträge vorhanden.</td>
            </tr>
          ) : (
            filteredData.map((p, idx) => (
              <tr key={p.id_lehrbetriebe_lernende ?? idx}>
                <td>{p.lehrbetrieb_name || p.nr_lehrbetrieb}</td>
                <td>{p.lernende_name || p.nr_lernende}</td>
                <td>{p.start ?? "-"}</td>
                <td>{p.ende ?? "-"}</td>
                <td>{p.beruf ?? "-"}</td>
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
                Nr. Lehrbetrieb
                <input
                  value={String(editForm.nr_lehrbetrieb ?? "")}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      nr_lehrbetrieb: Number(e.target.value),
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

              <label>
                Start
                <input
                  type="date"
                  value={editForm.start ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      start: e.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Ende
                <input
                  type="date"
                  value={editForm.ende ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      ende: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="full-width">
                Beruf
                <input
                  value={editForm.beruf ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      beruf: e.target.value,
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
      </main>
    </>
  );
}