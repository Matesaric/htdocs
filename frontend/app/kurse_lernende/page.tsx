"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

type KurseLernende = {
  id_kurse_lernende?: number;
  nr_kurs?: number | string;
  nr_lernende?: number | string;
  note?: number | string;
};

export default function KurseLernendePage() {
  const [data, setData] = useState<KurseLernende[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<KurseLernende | null>(null);
  const [editForm, setEditForm] = useState<Partial<KurseLernende>>({});
  const [origItem, setOrigItem] = useState<KurseLernende | null>(null);

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
    setOrigItem(p);
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
    setOrigItem(null);
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

      const previous = origItem;

      setData((current) =>
        current
          ? current.map((item) =>
              item.id_kurse_lernende === id
                ? { ...item, ...editForm }
                : item
            )
          : current
      );

      setEditOpen(false);

      try {
        const resp = await fetch(
          `http://localhost/kurse_lernende.php?id_kurse_lernende=${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_kurse_lernende: id,
              ...editForm,
            }),
          }
        );

        const text = await resp.text();
        if (!resp.ok) throw new Error(text);
      } catch {
        alert("Fehler beim Speichern");
        if (previous) {
          setData((current) =>
            current
              ? current.map((item) =>
                  item.id_kurse_lernende ===
                  previous.id_kurse_lernende
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
        "http://localhost/kurse_lernende.php",
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
        createdId = JSON.parse(text)?.id_kurse_lernende;
      } catch {}

      const newRow: KurseLernende = {
        ...(editForm as KurseLernende),
        ...(createdId ? { id_kurse_lernende: createdId } : {}),
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

  const handleDelete = async (p: KurseLernende) => {
    const id = p.id_kurse_lernende;
    if (!id) return;

    if (!confirm(`Löschen bestätigen für ID: ${id}?`)) return;

    let removed: KurseLernende | null = null;

    setData((prev) => {
      if (!prev) return prev;
      return prev.filter((item) => {
        if (item.id_kurse_lernende === id) {
          removed = item;
          return false;
        }
        return true;
      });
    });

    try {
      await fetch(
        `http://localhost/kurse_lernende.php?id_kurse_lernende=${id}`,
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

      {loading && <p>Lade Daten …</p>}
      {error && <p>Fehler: {error}</p>}

      <table aria-label="Kurse Lernende Tabelle">
        <thead>
          <tr>
            <th>Nr. Kurs</th>
            <th>Nr. Lernende</th>
            <th>Note</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={4}>Keine Einträge vorhanden.</td>
            </tr>
          ) : (
            data.map((p, idx) => (
              <tr key={p.id_kurse_lernende ?? idx}>
                <td>{p.nr_kurs}</td>
                <td>{p.nr_lernende}</td>
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
      </main>
    </>
  );
}