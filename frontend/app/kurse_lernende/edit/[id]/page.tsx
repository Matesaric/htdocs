"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";

type FormData = {
  id_kurse_lernende?: number;
  nr_kurs?: number | string;
  nr_lernende?: number | string;
  note?: number | string;
};

export default function KurseLernendeEditPage({ params }: { params: unknown }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { id } = React.use(params as any) as { id: string };
  const router = useRouter();
  const [form, setForm] = useState<FormData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kurse, setKurse] = useState<any[]>([]);
  const [lernende, setLernende] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost/kurse.php?all=true")
      .then((r) => r.ok ? r.json() : [])
      .then((json) => setKurse(Array.isArray(json) ? json : []))
      .catch(() => setKurse([]));

    fetch("http://localhost/lernende.php?all=true")
      .then((r) => r.ok ? r.json() : [])
      .then((json) => setLernende(Array.isArray(json) ? json : []))
      .catch(() => setLernende([]));

    setLoading(true);
    fetch(`http://localhost/kurse_lernende.php?id_kurse_lernende=${encodeURIComponent(id)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const p = Array.isArray(data) ? data[0] : data;
        setForm({
          id_kurse_lernende: p.id_kurse_lernende,
          nr_kurs:    p.nr_kurs    ?? "",
          nr_lernende:p.nr_lernende?? "",
          note:       p.note       ?? "",
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      const resp = await fetch(
        `http://localhost/kurse_lernende.php?id_kurse_lernende=${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_kurse_lernende: Number(id), ...form }),
        }
      );
      if (!resp.ok) throw new Error(await resp.text());
      router.push("/kurse_lernende");
    } catch (e: unknown) {
      alert("Fehler beim Speichern: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <h1>Eintrag bearbeiten</h1>
        {loading && <p>Lade Daten…</p>}
        {error && <p>Fehler: {error}</p>}

        <div className="form-grid">
          <label>
            Kurs
            <select
              value={String(form.nr_kurs ?? "")}
              onChange={(e) => setForm((f) => ({ ...f, nr_kurs: e.target.value === "" ? "" : Number(e.target.value) }))}
            >
              <option value="">Bitte wählen</option>
              {kurse.map((k, idx) => (
                <option key={k.id_kurs ?? idx} value={k.id_kurs ?? k.id}>
                  {k.kursnummer
                    ? `${k.kursnummer}${k.kursthema ? " – " + k.kursthema : ""}`
                    : k.kursthema ?? k.id_kurs}
                </option>
              ))}
            </select>
          </label>

          <label>
            Lernende/r
            <select
              value={String(form.nr_lernende ?? "")}
              onChange={(e) => setForm((f) => ({ ...f, nr_lernende: e.target.value === "" ? "" : Number(e.target.value) }))}
            >
              <option value="">Bitte wählen</option>
              {lernende.map((l, idx) => (
                <option key={l.id_lernende ?? idx} value={l.id_lernende ?? l.id}>
                  {l.lernende_name ?? (
                    `${l.vorname ?? ""} ${l.nachname ?? ""}`.trim() || String(l.id_lernende ?? l.id)
                  )}
                </option>
              ))}
            </select>
          </label>

          <label className="full-width">
            Note
            <input
              type="number"
              step="0.1"
              min="1"
              max="6"
              value={form.note ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </label>
        </div>

        <div className="modal-buttons">
          <button onClick={() => router.push("/kurse_lernende")}>Abbrechen</button>
          <button onClick={handleSave}>Speichern</button>
        </div>
      </main>
    </>
  );
}