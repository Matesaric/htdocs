"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

// duplicate of the edit form, but always in "new" mode

type Kurs = {
  id_kurs?: number;
  kursnummer?: string;
  kursthema?: string;
  nr_dozent?: number | string;
  startdatum?: string;
  enddatum?: string;
  dauer?: number | string;
  dozent_name?: string;
  [key: string]: unknown;
};

type SimpleDozent = {
  id_dozent?: number;
  vorname?: string;
  nachname?: string;
  [key: string]: unknown;
};

export default function KursCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Kurs>>({});
  const [dozentenList, setDozentenList] = useState<SimpleDozent[] | null>(null);

  useEffect(() => {
    const fetchDozenten = async () => {
      try {
        const resp = await fetch("http://localhost/dozenten.php?all=true");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        setDozentenList(Array.isArray(json) ? (json as SimpleDozent[]) : []);
      } catch {
        setDozentenList([]);
      }
    };
    fetchDozenten();
  }, []);

  const handleSave = async () => {
    try {
      const resp = await fetch("http://localhost/kurse.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!resp.ok) throw new Error(await resp.text());
      router.push("/kurse");
    } catch (e: unknown) {
      alert("Fehler beim Speichern: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <h1>Neuer Kurs</h1>

        <div className="form-grid">
          <label>
            Kursnummer
            <input
              value={(form.kursnummer as string) || ""}
              onChange={(e) => setForm((f) => ({ ...f, kursnummer: e.target.value }))}
            />
          </label>

          <label>
            Dauer (Tage)
            <input
              type="number"
              value={String((form.dauer as unknown) ?? "")}
              onChange={(e) =>
                setForm((f) => ({ ...f, dauer: e.target.value === "" ? "" : Number(e.target.value) }))
              }
            />
          </label>

          <label className="full-width">
            Kursthema
            <input
              value={(form.kursthema as string) || ""}
              onChange={(e) => setForm((f) => ({ ...f, kursthema: e.target.value }))}
            />
          </label>

          <label>
            Dozent
            <select
              value={String((form.nr_dozent as unknown) ?? "")}
              onChange={(e) =>
                setForm((f) => ({ ...f, nr_dozent: e.target.value === "" ? "" : Number(e.target.value) }))
              }
            >
              <option value="">Bitte wählen</option>
              {dozentenList &&
                dozentenList.map((d) => (
                  <option key={String(d.id_dozent ?? d.id)} value={String(d.id_dozent ?? d.id)}>
                    {`${d.vorname ?? ""} ${d.nachname ?? ""}`.trim()}
                  </option>
                ))}
            </select>
          </label>

          <label>
            Startdatum
            <input
              type="date"
              value={(form.startdatum as string) || ""}
              onChange={(e) => setForm((f) => ({ ...f, startdatum: e.target.value }))}
            />
          </label>

          <label>
            Enddatum
            <input
              type="date"
              value={(form.enddatum as string) || ""}
              onChange={(e) => setForm((f) => ({ ...f, enddatum: e.target.value }))}
            />
          </label>
        </div>

        <div className="modal-buttons">
          <button onClick={() => router.push("/kurse")}>Abbrechen</button>
          <button onClick={handleSave}>Erstellen</button>
        </div>
      </main>
    </>
  );
}
