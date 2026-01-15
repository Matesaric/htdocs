"use client";
import React, { useEffect, useState } from "react";

type Lernender = {
  id_lernende?: number;
  vorname?: string;
  nachname?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  nr_land?: number | string;
  geschlecht?: string;
  telefon?: string;
  handy?: string;
  email?: string;
  email_privat?: string;
  birthdate?: string;
  [key: string]: any;
};

export default function LernendePage() {
  const [data, setData] = useState<Lernender[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Lernender | null>(null);
  const [editForm, setEditForm] = useState<Partial<Lernender>>({});
  const [origItem, setOrigItem] = useState<Lernender | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch("http://localhost/lernende.php?all=true");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        if (!Array.isArray(json)) throw new Error("Unerwartetes Antwortformat");
        setData(json as Lernender[]);
      } catch (e: any) {
        setError(e?.message ?? "Fehler beim Laden");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openEdit = (p: Lernender) => {
    setOrigItem(p);
    setEditItem(p);
    setEditForm({
      id_lernende: p.id_lernende,
      vorname: p.vorname ?? "",
      nachname: p.nachname ?? "",
      strasse: p.strasse ?? "",
      plz: p.plz ?? "",
      ort: p.ort ?? "",
      nr_land: p.nr_land ?? "",
      geschlecht: p.geschlecht ?? "",
      telefon: p.telefon ?? "",
      handy: p.handy ?? "",
      email: p.email ?? "",
      email_privat: p.email_privat ?? "",
      birthdate: p.birthdate ?? "",
    });
    setEditOpen(true);
  };

  const handleNew = () => {
    setOrigItem(null);
    setEditItem(null);
    setEditForm({
      vorname: "",
      nachname: "",
      strasse: "",
      plz: "",
      ort: "",
      nr_land: "",
      geschlecht: "",
      telefon: "",
      handy: "",
      email: "",
      email_privat: "",
      birthdate: "",
    });
    setEditOpen(true);
  };

  const handleEdit = (p: Lernender) => openEdit(p);

  const handleSave = async () => {
    const isEdit = !!editItem;

    if (isEdit) {
      const idRaw = editForm.id_lernende ?? editItem!.id_lernende ?? editItem!.id;
      if (idRaw == null || String(idRaw).trim() === "") {
        alert("Keine gültige ID gefunden – Update unmöglich");
        return;
      }
      const id = Number(idRaw);
      const previousLernender = origItem;

      setData((currentData) =>
        currentData
          ? currentData.map((item) =>
              String(item.id_lernende ?? item.id) === String(id)
                ? { ...item, ...editForm, id_lernende: id }
                : item
            )
          : currentData
      );

      setEditOpen(false);

      try {
        const resp = await fetch(`http://localhost/lernende.php?id_lernende=${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_lernende: id,
            ...editForm,
          }),
        });

        const text = await resp.text();
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text}`);
      } catch (e: any) {
        alert("Fehler beim Speichern: " + (e?.message ?? e));

        if (previousLernender) {
          const previousId = String(previousLernender.id_lernende ?? previousLernender.id ?? "");
          setData((currentData) =>
            currentData
              ? currentData.map((item) =>
                  String(item.id_lernende ?? item.id ?? "") === previousId ? previousLernender : item
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
      const resp = await fetch("http://localhost/lernende.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const text = await resp.text();
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text}`);

      let createdId: number | undefined;
      try {
        const j = JSON.parse(text);
        createdId = j?.id_lernende;
      } catch {}

      const createdRow: Lernender = {
        ...(editForm as Lernender),
        ...(createdId != null ? { id_lernende: createdId } : {}),
      };

      setData((currentData) => (currentData ? [createdRow, ...currentData] : [createdRow]));
    } catch (e: any) {
      alert("Erstellen fehlgeschlagen: " + (e?.message ?? e));
    } finally {
      setEditItem(null);
      setOrigItem(null);
    }
  };

  const handleDelete = async (p: Lernender) => {
    const idRaw = p.id_lernende ?? p.id;
    if (idRaw == null || String(idRaw).trim() === "") {
      alert("Keine gültige ID gefunden – Löschen unmöglich");
      return;
    }

    const idStr = String(idRaw);

    if (!confirm(`Löschen bestätigen für ID: ${idStr}?`)) return;

    let removedLernender: Lernender | null = null;

    setData((previousData) => {
      if (!previousData) return previousData;
      const filteredData = previousData.filter((item) => {
        const itemId = String(item.id_lernende ?? item.id ?? "");
        if (itemId === idStr) {
          removedLernender = item;
          return false;
        }
        return true;
      });
      return filteredData;
    });

    try {
      const resp = await fetch(
        `http://localhost/lernende.php?id_lernende=${idStr}`,
        { method: "DELETE" }
      );

      const text = await resp.text();
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text}`);
    } catch (e: any) {
      alert("Löschen fehlgeschlagen: " + (e?.message ?? e));

      if (removedLernender) {
        setData((previousData) => (previousData ? [removedLernender!, ...previousData] : [removedLernender!]));
      }
    }
  };

  return (
    <main>
      <h1>Kursverwaltung - Lernende</h1>
      
      <div className="button-group">
        <button onClick={() => history.back()}>Geh zurück</button>
        <button onClick={handleNew}>Neuer Lernender</button>
      </div>

      {loading && <p>Lade Daten …</p>}
      {error && <p>Fehler: {error}</p>}

      <table aria-label="Lernende Tabelle">
        <thead>
          <tr>
            <th>Vorname</th>
            <th>Nachname</th>
            <th>Geschlecht</th>
            <th>E-Mail</th>
            <th>Ort</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={6}>
                Keine Einträge vorhanden.
              </td>
            </tr>
          ) : (
            data.map((p, idx) => (
              <tr key={p.id_lernende ?? p.id ?? idx}>
                <td>{p.vorname ?? "-"}</td>
                <td>{p.nachname ?? "-"}</td>
                <td>{p.geschlecht ?? "-"}</td>
                <td>{p.email ?? p.email_privat ?? "-"}</td>
                <td>{p.ort ?? "-"}</td>
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
            <h2>{editItem ? "Bearbeite Lernenden" : "Neuer Lernender"}</h2>

            <div className="form-grid">
              <label>
                Vorname
                <input value={(editForm.vorname as string) || ""} onChange={(e) => setEditForm((f) => ({ ...f, vorname: e.target.value }))} />
              </label>

              <label>
                Nachname
                <input value={(editForm.nachname as string) || ""} onChange={(e) => setEditForm((f) => ({ ...f, nachname: e.target.value }))} />
              </label>

              <label className="full-width">
                Strasse
                <input value={(editForm.strasse as string) || ""} onChange={(e) => setEditForm((f) => ({ ...f, strasse: e.target.value }))} />
              </label>

              <label>
                PLZ
                <input value={(editForm.plz as string) || ""} onChange={(e) => setEditForm((f) => ({ ...f, plz: e.target.value }))} />
              </label>

              <label>
                Ort
                <input value={(editForm.ort as string) || ""} onChange={(e) => setEditForm((f) => ({ ...f, ort: e.target.value }))} />
              </label>

              <label>
                Nr. Land
                <input value={String((editForm.nr_land as any) ?? "")} onChange={(e) => setEditForm((f) => ({ ...f, nr_land: e.target.value === "" ? "" : Number(e.target.value) }))} />
              </label>

              <label>
                Geschlecht (m/w/d)
                <select value={(editForm.geschlecht as string) || ""} onChange={(e) => setEditForm((f) => ({ ...f, geschlecht: e.target.value }))}>
                  <option value="">-- Bitte wählen --</option>
                  <option value="m">Männlich</option>
                  <option value="w">Weiblich</option>
                  <option value="d">Divers</option>
                </select>
              </label>

              <label>
                Telefon
                <input value={(editForm.telefon as string) || ""} onChange={(e) => setEditForm((f) => ({ ...f, telefon: e.target.value }))} />
              </label>

              <label>
                Handy
                <input value={(editForm.handy as string) || ""} onChange={(e) => setEditForm((f) => ({ ...f, handy: e.target.value }))} />
              </label>

              <label className="full-width">
                E-Mail
                <input value={(editForm.email as string) || ""} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
              </label>

              <label className="full-width">
                E-Mail Privat
                <input value={(editForm.email_privat as string) || ""} onChange={(e) => setEditForm((f) => ({ ...f, email_privat: e.target.value }))} />
              </label>

              <label className="full-width">
                Geburtsdatum
                <input type="date" value={(editForm.birthdate as string) || ""} onChange={(e) => setEditForm((f) => ({ ...f, birthdate: e.target.value }))} />
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
  );
}