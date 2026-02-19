"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

type FormData = {
  nr_lehrbetrieb?: number | string;
  nr_lernende?: number | string;
  start?: string;
  ende?: string;
  beruf?: string;
};

export default function LehrbetriebLernendeCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({ nr_lehrbetrieb: "", nr_lernende: "", start: "", ende: "", beruf: "" });
  const [lehrbetriebe, setLehrbetriebe] = useState<any[]>([]);
  const [lernende, setLernende] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost/lehrbetriebe.php?all=true")
      .then((r) => r.ok ? r.json() : [])
      .then((json) => setLehrbetriebe(Array.isArray(json) ? json : []))
      .catch(() => setLehrbetriebe([]));

    fetch("http://localhost/lernende.php?all=true")
      .then((r) => r.ok ? r.json() : [])
      .then((json) => setLernende(Array.isArray(json) ? json : []))
      .catch(() => setLernende([]));
  }, []);

  const handleSave = async () => {
    try {
      const resp = await fetch("http://localhost/lehrbetrieb_lernende.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!resp.ok) throw new Error(await resp.text());
      router.push("/lehrbetriebe_lernende");
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
            Lehrbetrieb
            <select
              value={String(form.nr_lehrbetrieb ?? "")}
              onChange={(e) => setForm((f) => ({ ...f, nr_lehrbetrieb: e.target.value === "" ? "" : Number(e.target.value) }))}
            >
              <option value="">Bitte wählen</option>
              {lehrbetriebe.map((lb, idx) => (
                <option key={lb.id_lehrbetrieb ?? idx} value={lb.id_lehrbetrieb ?? lb.id}>
                  {lb.firma ?? lb.lehrbetrieb_name ?? lb.id_lehrbetrieb}
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

          <label>
            Start
            <input type="date" value={form.start || ""} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} />
          </label>

          <label>
            Ende
            <input type="date" value={form.ende || ""} onChange={(e) => setForm((f) => ({ ...f, ende: e.target.value }))} />
          </label>

          <label className="full-width">
            Beruf
            <input value={form.beruf || ""} onChange={(e) => setForm((f) => ({ ...f, beruf: e.target.value }))} />
          </label>
        </div>

        <div className="modal-buttons">
          <button onClick={() => router.push("/lehrbetriebe_lernende")}>Abbrechen</button>
          <button onClick={handleSave}>Erstellen</button>
        </div>
      </main>
    </>
  );
}