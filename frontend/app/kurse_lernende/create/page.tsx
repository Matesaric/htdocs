"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

type FormData = {
  nr_kurs?: number | string;
  nr_lernende?: number | string;
  note?: number | string;
};

export default function KurseLernendeCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({ nr_kurs: "", nr_lernende: "", note: "" });
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
  }, []);

  const handleSave = async () => {
    try {
      const resp = await fetch("http://localhost/kurse_lernende.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!resp.ok) throw new Error(await resp.text());
      router.push("/kurse_lernende");
    } catch (e: unknown) {
      alert("Fehler beim Erstellen: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <h1>Neuer Eintrag</h1>

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
          <button onClick={handleSave}>Erstellen</button>
        </div>
      </main>
    </>
  );
}