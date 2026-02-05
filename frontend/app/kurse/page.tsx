"use client";
import React, { useEffect, useState } from "react";
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
  [key: string]: any;
};

export default function KursePage() {
  const [data, setData] = useState<Kurs[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Kurs | null>(null);
  const [editForm, setEditForm] = useState<Partial<Kurs>>({});
  const [origItem, setOrigItem] = useState<Kurs | null>(null);

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
      } catch (e: any) {
        setError(e?.message ?? "Fehler beim Laden");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openEdit = (p: Kurs) => {
    setOrigItem(p);
    setEditItem(p);
    setEditForm({
      id_kurs: p.id_kurs,
      kursnummer: p.kursnummer ?? "",
      kursthema: p.kursthema ?? "",
      nr_dozent: p.nr_dozent ?? "",
      startdatum: p.startdatum ?? "",
      enddatum: p.enddatum ?? "",
      dauer: p.dauer ?? "",
    });
    setEditOpen(true);
  };

  const handleNew = () => {
    setOrigItem(null);
    setEditItem(null);
    setEditForm({
      kursnummer: "",
      kursthema: "",
      nr_dozent: "",
      startdatum: "",
      enddatum: "",
      dauer: "",
    });
    setEditOpen(true);
  };

  const handleEdit = (p: Kurs) => openEdit(p);

  const handleSave = async () => {
    const isEdit = !!editItem;

    if (isEdit) {
      const idRaw = editForm.id_kurs ?? editItem!.id_kurs ?? editItem!.id;
      if (idRaw == null || String(idRaw).trim() === "") {
        alert("Keine gültige ID gefunden – Update unmöglich");
        return;
      }
      const id = Number(idRaw);
      const previousKurs = origItem;

      setData((currentData) =>
        currentData
          ? currentData.map((item) =>
              String(item.id_kurs ?? item.id) === String(id)
                ? { ...item, ...editForm, id_kurs: id }
                : item
            )
          : currentData
      );

      setEditOpen(false);

      try {
        const payload = {
          id_kurs: id,
          ...editForm,
        };
        console.log("Sende PUT-Request mit:", payload);
        
        const resp = await fetch(`http://localhost/kurse.php?id_kurs=${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        console.log("Response Status:", resp.status);
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`HTTP ${resp.status}: ${text}`);
        }
      } catch (e: any) {
        alert("Fehler beim Speichern: " + (e?.message ?? e));

        if (previousKurs) {
          const previousId = String(previousKurs.id_kurs ?? previousKurs.id ?? "");
          setData((currentData) =>
            currentData
              ? currentData.map((item) =>
                  String(item.id_kurs ?? item.id ?? "") === previousId ? previousKurs : item
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
      
      const resp = await fetch("http://localhost/kurse.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      console.log("Response Status:", resp.status);
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${text}`);
      }

      const text = await resp.text();
      let createdId: number | undefined;
      try {
        const j = JSON.parse(text);
        createdId = j?.id_kurs;
      } catch {}

      const createdRow: Kurs = {
        ...(editForm as Kurs),
        ...(createdId != null ? { id_kurs: createdId } : {}),
      };

      setData((currentData) => (currentData ? [createdRow, ...currentData] : [createdRow]));
    } catch (e: any) {
      alert("Erstellen fehlgeschlagen: " + (e?.message ?? e));
    } finally {
      setEditItem(null);
      setOrigItem(null);
    }
  };

  const handleDelete = async (p: Kurs) => {
    const idRaw = p.id_kurs ?? p.id;
    if (idRaw == null || String(idRaw).trim() === "") {
      alert("Keine gültige ID gefunden – Löschen unmöglich");
      return;
    }

    const idStr = String(idRaw);

    if (!confirm(`Löschen bestätigen für ID: ${idStr}?`)) return;

    let removedKurs: Kurs | null = null;

    setData((previousData) => {
      if (!previousData) return previousData;
      const filteredData = previousData.filter((item) => {
        const itemId = String(item.id_kurs ?? item.id ?? "");
        if (itemId === idStr) {
          removedKurs = item;
          return false;
        }
        return true;
      });
      return filteredData;
    });

    try {
      console.log("DELETE Response Status");
      const resp = await fetch(
        `http://localhost/kurse.php?id_kurs=${idStr}`,
        { method: "DELETE" }
      );

      console.log("DELETE Response Status:", resp.status);
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${text}`);
      }
    } catch (e: any) {
      alert("Löschen fehlgeschlagen: " + (e?.message ?? e));

      if (removedKurs) {
        setData((previousData) => (previousData ? [removedKurs!, ...previousData] : [removedKurs!]));
      }
    }
  };

  return (
    <>
      <Navbar />
      <main>

      <div className="button-group">
        <button onClick={handleNew}>Neuer Kurs</button>
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
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={7}>
                Keine Einträge vorhanden.
              </td>
            </tr>
          ) : (
            data.map((p, idx) => (
              <tr key={p.id_kurs ?? p.id ?? idx}>
                <td>{p.kursnummer ?? "-"}</td>
                <td>{p.kursthema ?? "-"}</td>
                <td>{p.dozent_name || p.nr_dozent || "-"}</td>
                <td>{p.startdatum ?? "-"}</td>
                <td>{p.enddatum ?? "-"}</td>
                <td>{p.dauer ?? "-"}</td>
                <td>
                  <button onClick={() => handleEdit(p)}>
                    Bearbeiten
                  </button>
                  <button onClick={() => handleDelete(p)}>
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
            <h2>{editItem ? "Bearbeite Kurs" : "Neuer Kurs"}</h2>

            <div className="form-grid">
              <label>
                Kursnummer
                <input value={(editForm.kursnummer as string) || ""} onChange={(e) => setEditForm((f) => ({ ...f, kursnummer: e.target.value }))} />
              </label>

              <label>
                Dauer (Tage)
                <input type="number" value={String((editForm.dauer as any) ?? "")} onChange={(e) => setEditForm((f) => ({ ...f, dauer: e.target.value === "" ? "" : Number(e.target.value) }))} />
              </label>

              <label className="full-width">
                Kursthema
                <input value={(editForm.kursthema as string) || ""} onChange={(e) => setEditForm((f) => ({ ...f, kursthema: e.target.value }))} />
              </label>

              <label>
                Nr. Dozent
                <input type="number" value={String((editForm.nr_dozent as any) ?? "")} onChange={(e) => setEditForm((f) => ({ ...f, nr_dozent: e.target.value === "" ? "" : Number(e.target.value) }))} />
              </label>

              <label>
                Startdatum
                <input type="date" value={(editForm.startdatum as string) || ""} onChange={(e) => setEditForm((f) => ({ ...f, startdatum: e.target.value }))} />
              </label>

              <label>
                Enddatum
                <input type="date" value={(editForm.enddatum as string) || ""} onChange={(e) => setEditForm((f) => ({ ...f, enddatum: e.target.value }))} />
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
