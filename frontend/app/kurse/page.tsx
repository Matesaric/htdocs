"use client";
import React, { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";

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

type SimpleDozent = {
  id_dozent?: number;
  vorname?: string;
  nachname?: string;
  [key: string]: any;
};

export default function KursePage() {
  const [data, setData] = useState<Kurs[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Kurs | null>(null);
  const [editForm, setEditForm] = useState<Partial<Kurs>>({});
  
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [dozentenList, setDozentenList] = useState<SimpleDozent[] | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ item: Kurs | null; reason?: string } | null>(null);

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
    // lade Dozenten für Dropdown
    const fetchDozenten = async () => {
      try {
        const resp = await fetch("http://localhost/dozenten.php?all=true");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        setDozentenList(Array.isArray(json) ? json as SimpleDozent[] : []);
      } catch {
        setDozentenList([]);
      }
    };

    fetchDozenten();
  }, []);

  const openEdit = (p: Kurs) => {
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

      setEditOpen(false);

      try {
        const payload = { id_kurs: id, ...editForm };
        console.log("Sende PUT-Request mit:", payload);

        const resp = await fetch(`http://localhost/kurse.php?id_kurs=${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const text = await resp.text();
        console.log("Response Status:", resp.status, "Response Text:", text);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text}`);
        // Server hat gespeichert -> jetzt neu laden
        handleRefresh();
        return;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        alert("Fehler beim Speichern: " + msg);
        // Fehler beim Speichern — keine lokale Rücksetzung nötig (kein optimistisches Update)
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

      const text = await resp.text();
      console.log("Response Status:", resp.status, "Response Text:", text);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text}`);
      // Server hat erstellt -> jetzt neu laden
      handleRefresh();
      return;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      alert("Erstellen fehlgeschlagen: " + msg);
    } finally {
      setEditItem(null);
      
    }
  };

  const handleDelete = async (p: Kurs) => {
    const idRaw = p.id_kurs ?? p.id;
    if (idRaw == null || String(idRaw).trim() === "") {
      alert("Keine gültige ID gefunden – Löschen unmöglich");
      return;
    }
    // open styled confirm dialog
    setDeleteConfirm({ item: p });
  };

  const confirmDelete = async () => {
    const p = deleteConfirm?.item;
    if (!p) {
      setDeleteConfirm(null);
      return;
    }
    const idRaw = p.id_kurs ?? p.id;
    const idStr = String(idRaw);
    try {
      const resp = await fetch(`http://localhost/kurse.php?id_kurs=${idStr}`, { method: "DELETE" });
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
          <button onClick={handleNew}>Neuer Kurs</button>
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
          {!filteredData || filteredData.length === 0 ? (
            <tr>
              <td colSpan={7}>
                Keine Einträge vorhanden.
              </td>
            </tr>
          ) : (
            filteredData.map((k, idx) => (
              <tr key={k.id_kurs ?? k.id ?? idx}>
                <td>{k.kursnummer ?? "-"}</td>
                <td>{k.kursthema ?? "-"}</td>
                <td>{k.dozent_name || k.nr_dozent || "-"}</td>
                <td>{k.startdatum ?? "-"}</td>
                <td>{k.enddatum ?? "-"}</td>
                <td>{k.dauer ?? "-"}</td>
                <td>
                  <button onClick={() => handleEdit(k)}>
                    Bearbeiten
                  </button>
                  <button onClick={() => handleDelete(k)}>
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
                Dozent
                <select value={String((editForm.nr_dozent as any) ?? "")} onChange={(e) => setEditForm((f) => ({ ...f, nr_dozent: e.target.value === "" ? "" : Number(e.target.value) }))}>
                  <option value="">Bitte wählen</option>
                  {dozentenList && dozentenList.map((d) => (
                    <option key={d.id_dozent ?? d.id} value={d.id_dozent ?? d.id}>{`${d.vorname ?? ""} ${d.nachname ?? ""}`.trim()}</option>
                  ))}
                </select>
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
              <button onClick={() => { setEditOpen(false); setEditItem(null); }}>
                Abbrechen
              </button>
              <button onClick={handleSave}>{editItem ? "Speichern" : "Erstellen"}</button>
            </div>
          </div>
        </div>
      )}
      {deleteConfirm?.item && (
        <ConfirmModal
          title="Kurs löschen?"
          reason={deleteConfirm.reason ?? null}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={confirmDelete}
        >
          <p>Möchten Sie diesen Kurs wirklich löschen?</p>
          <div className="delete-info">
            <h4>Kurs-Informationen:</h4>
            <div className="delete-info-field">
              <strong>Kursnummer:</strong> {deleteConfirm.item.kursnummer ?? "-"}
            </div>
            <div className="delete-info-field">
              <strong>Thema:</strong> {deleteConfirm.item.kursthema ?? "-"}
            </div>
            <div className="delete-info-field">
              <strong>ID:</strong> {deleteConfirm.item.id_kurs ?? deleteConfirm.item.id}
            </div>
          </div>
        </ConfirmModal>
      )}
      </main>
    </>
  );
}
