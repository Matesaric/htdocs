"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";

// types duplicated from kurse/page.tsx - keep in sync

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

export default function KursEditPage({ params }: { params: unknown }) {
  // params is a promise in client components – unwrap with React.use()
  // params comes from Next.js and is a promise; cast to any to unwrap
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { id } = React.use(params as any) as { id: string };
  const router = useRouter();
  const [form, setForm] = useState<Partial<Kurs>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dozentenList, setDozentenList] = useState<SimpleDozent[] | null>(null);

  const isNew = id === "new";

  useEffect(() => {
    // load dozenten for dropdown
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

    if (!isNew) {
      setLoading(true);
      fetch(`http://localhost/kurse.php?id_kurs=${encodeURIComponent(id)}`)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((data) => {
          // assume API returns object or array
          const kurs = Array.isArray(data) ? data[0] : data;
          setForm({
            id_kurs: kurs.id_kurs ?? kurs.id,
            kursnummer: kurs.kursnummer ?? "",
            kursthema: kurs.kursthema ?? "",
            nr_dozent: kurs.nr_dozent ?? "",
            startdatum: kurs.startdatum ?? "",
            enddatum: kurs.enddatum ?? "",
            dauer: kurs.dauer ?? "",
          });
        })
        .catch((e) => setError(e instanceof Error ? e.message : String(e)))
        .finally(() => setLoading(false));
    } else {
      setForm({});
    }
  }, [id, isNew]);

  const handleSave = async () => {
    try {
      if (!isNew) {
        const payload = { id_kurs: Number(id), ...form };
        const resp = await fetch(`http://localhost/kurse.php?id_kurs=${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!resp.ok) throw new Error(await resp.text());
      } else {
        const resp = await fetch("http://localhost/kurse.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!resp.ok) throw new Error(await resp.text());
      }
      router.push("/kurse");
    } catch (e: unknown) {
      alert("Fehler beim Speichern: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <h1>{isNew ? "Neuer Kurs" : "Bearbeite Kurs"}</h1>
        {loading && <p>Lade Daten…</p>}
        {error && <p>Fehler: {error}</p>}

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
          <button onClick={handleSave}>{isNew ? "Erstellen" : "Speichern"}</button>
        </div>
      </main>
    </>
  );
}
