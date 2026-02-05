"use client";
import React, { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import Navbar from "../components/Navbar";

type Dozent = {
  id_dozent?: number;
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
  birthdate?: string;
  land_name?: string;
  [key: string]: any;
};

export default function DozentenPage() {
  const [data, setData] = useState<Dozent[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Dozent | null>(null);
  const [editForm, setEditForm] = useState<Partial<Dozent>>({});
  const [origItem, setOrigItem] = useState<Dozent | null>(null);
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
        const resp = await fetch("http://localhost/dozenten.php?all=true");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        if (!Array.isArray(json)) throw new Error("Unerwartetes Antwortformat");
        setData(json as Dozent[]);
      } catch (e: any) {
        setError(e?.message ?? "Fehler beim Laden");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openEdit = (p: Dozent) => {
    setOrigItem(p);
    setEditItem(p);
    setEditForm({
      id_dozent: p.id_dozent,
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
      birthdate: "",
    });
    setEditOpen(true);
  };

  const handleEdit = (p: Dozent) => openEdit(p);

  const handleSave = async () => {
    const isEdit = !!editItem;

    if (isEdit) {
      const idRaw = editForm.id_dozent ?? editItem!.id_dozent ?? editItem!.id;
      if (idRaw == null || String(idRaw).trim() === "") {
        alert("Keine gültige ID gefunden – Update unmöglich");
        return;
      }
      const id = Number(idRaw);
      const previousDozent = origItem;

      setData((currentData) =>
        currentData
          ? currentData.map((item) =>
              String(item.id_dozent ?? item.id) === String(id)
                ? { ...item, ...editForm, id_dozent: id }
                : item
            )
          : currentData
      );

      setEditOpen(false);

      try {
        const payload = {
          id_dozent: id,
          ...editForm,
        };
        console.log("Sende PUT-Request mit:", payload);
        
        const resp = await fetch(`http://localhost/dozenten.php?id_dozent=${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const text = await resp.text();
        console.log("Response Status:", resp.status, "Response Text:", text);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text}`);
      } catch (e: any) {
        alert("Fehler beim Speichern: " + (e?.message ?? e));

        if (previousDozent) {
          const previousId = String(previousDozent.id_dozent ?? previousDozent.id ?? "");
          setData((currentData) =>
            currentData
              ? currentData.map((item) =>
                  String(item.id_dozent ?? item.id ?? "") === previousId ? previousDozent : item
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
      
      const resp = await fetch("http://localhost/dozenten.php", {
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
        createdId = j?.id_dozent;
      } catch {}

      const createdRow: Dozent = {
        ...(editForm as Dozent),
        ...(createdId != null ? { id_dozent: createdId } : {}),
      };

      setData((currentData) => (currentData ? [createdRow, ...currentData] : [createdRow]));
    } catch (e: any) {
      alert("Erstellen fehlgeschlagen: " + (e?.message ?? e));
    } finally {
      setEditItem(null);
      setOrigItem(null);
    }
  };

  const handleDelete = async (p: Dozent) => {
    const idRaw = p.id_dozent ?? p.id;
    if (idRaw == null || String(idRaw).trim() === "") {
      alert("Keine gültige ID gefunden – Löschen unmöglich");
      return;
    }

    const idStr = String(idRaw);

    if (!confirm(`Löschen bestätigen für ID: ${idStr}?`)) return;

    let removedDozent: Dozent | null = null;

    setData((previousData) => {
      if (!previousData) return previousData;
      const filteredData = previousData.filter((item) => {
        const itemId = String(item.id_dozent ?? item.id ?? "");
        if (itemId === idStr) {
          removedDozent = item;
          return false;
        }
        return true;
      });
      return filteredData;
    });

    try {
      const resp = await fetch(
        `http://localhost/dozenten.php?id_dozent=${idStr}`,
        { method: "DELETE" }
      );

      const text = await resp.text();
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text}`);
    } catch (e: any) {
      alert("Löschen fehlgeschlagen: " + (e?.message ?? e));

      if (removedDozent) {
        setData((previousData) => (previousData ? [removedDozent!, ...previousData] : [removedDozent!]));
      }
    }
  };

  return (
    <>
      <Navbar />
      <main>

      <div className="button-group">
        <div className="button-group-left">
          <button onClick={handleNew}>Neuer Dozent</button>
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

      <table aria-label="Dozenten Tabelle">
        <colgroup>
          <col style={{width: '130px'}} />
          <col style={{width: '130px'}} />
          <col style={{width: '90px'}} />
          <col style={{width: '200px'}} />
          <col style={{width: '120px'}} />
          <col style={{width: '180px'}} />
        </colgroup>
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
          {!filteredData || filteredData.length === 0 ? (
            <tr>
              <td colSpan={6}>
                Keine Einträge vorhanden.
              </td>
            </tr>
          ) : (
            filteredData.map((p, idx) => (
              <tr key={p.id_dozent ?? p.id ?? idx}>
                <td>{p.vorname ?? "-"}</td>
                <td>{p.nachname ?? "-"}</td>
                <td>{p.geschlecht ?? "-"}</td>
                <td>{p.email ?? "-"}</td>
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
            <h2>{editItem ? "Bearbeite Dozent" : "Neuer Dozent"}</h2>

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
                Birthdate
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
    </>
  );
}
