"use client";
import React, { useEffect, useState } from "react";

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

      const previous = origItem;

      setData((cur) =>
        cur
          ? cur.map((it) =>
              it.id_lehrbetrieb === id ? { ...it, ...editForm } : it
            )
          : cur
      );

      setEditOpen(false);

      try {
        const resp = await fetch(
          `http://localhost/lehrbetriebe.php?id_lehrbetrieb=${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_lehrbetrieb: id,
              ...editForm,
            }),
          }
        );

        const text = await resp.text();
        if (!resp.ok) throw new Error(text);
      } catch (e: any) {
        alert("Fehler beim Speichern");
        if (previous) {
          setData((cur) =>
            cur
              ? cur.map((it) =>
                  it.id_lehrbetrieb === previous.id_lehrbetrieb
                    ? previous
                    : it
                )
              : cur
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
      const resp = await fetch("http://localhost/lehrbetriebe.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const text = await resp.text();
      if (!resp.ok) throw new Error(text);

      let createdId: number | undefined;
      try {
        createdId = JSON.parse(text)?.id_lehrbetrieb;
      } catch {}

      const newRow: Lehrbetrieb = {
        ...(editForm as Lehrbetrieb),
        ...(createdId ? { id_lehrbetrieb: createdId } : {}),
      };

      setData((cur) => (cur ? [newRow, ...cur] : [newRow]));
    } catch {
      alert("Erstellen fehlgeschlagen");
    }
  };

  const handleDelete = async (item: Lehrbetrieb) => {
    const id = item.id_lehrbetrieb;
    if (!id) return;

    if (!confirm("Lehrbetrieb löschen?")) return;

    let removed: Lehrbetrieb | null = null;

    setData((cur) => {
      if (!cur) return cur;
      return cur.filter((it) => {
        if (it.id_lehrbetrieb === id) {
          removed = it;
          return false;
        }
        return true;
      });
    });

    try {
      await fetch(
        `http://localhost/lehrbetriebe.php?id_lehrbetrieb=${id}`,
        { method: "DELETE" }
      );
    } catch {
      if (removed) {
        setData((cur) => (cur ? [removed!, ...cur] : [removed!]));
      }
    }
  };

  return (
    <main>
      <h1>Willkommen zur Kursverwaltung - Lehrbetriebe</h1>
      <button onClick={() => history.back()}>Geh zurück</button>
      <button onClick={handleNew}>Neuer Lehrbetrieb</button>

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
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={5}>Keine Einträge</td>
            </tr>
          ) : (
            data.map((b, i) => (
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
    </main>
  );
}