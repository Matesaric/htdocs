"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";

type LehrbetriebForm = {
  id_lehrbetrieb?: number;
  firma?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
};

export default function LehrbetriebEditPage({ params }: { params: unknown }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { id } = React.use(params as any) as { id: string };
  const router = useRouter();
  const [form, setForm] = useState<LehrbetriebForm>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost/lehrbetriebe.php?id_lehrbetrieb=${encodeURIComponent(id)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const b = Array.isArray(data) ? data[0] : data;
        setForm({
          id_lehrbetrieb: b.id_lehrbetrieb ?? b.id,
          firma:   b.firma   ?? "",
          strasse: b.strasse ?? "",
          plz:     b.plz     ?? "",
          ort:     b.ort     ?? "",
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      const resp = await fetch(`http://localhost/lehrbetriebe.php?id_lehrbetrieb=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_lehrbetrieb: Number(id), ...form }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      router.push("/lehrbetriebe");
    } catch (e: unknown) {
      alert("Fehler beim Speichern: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <h1>Lehrbetrieb bearbeiten</h1>
        {loading && <p>Lade Daten…</p>}
        {error && <p>Fehler: {error}</p>}

        <div className="form-grid">
          <label className="full-width">
            Firma
            <input value={form.firma || ""} onChange={(e) => setForm((f) => ({ ...f, firma: e.target.value }))} />
          </label>
          <label className="full-width">
            Strasse
            <input value={form.strasse || ""} onChange={(e) => setForm((f) => ({ ...f, strasse: e.target.value }))} />
          </label>
          <label>
            PLZ
            <input value={form.plz || ""} onChange={(e) => setForm((f) => ({ ...f, plz: e.target.value }))} />
          </label>
          <label>
            Ort
            <input value={form.ort || ""} onChange={(e) => setForm((f) => ({ ...f, ort: e.target.value }))} />
          </label>
        </div>

        <div className="modal-buttons">
          <button onClick={() => router.push("/lehrbetriebe")}>Abbrechen</button>
          <button onClick={handleSave}>Speichern</button>
        </div>
      </main>
    </>
  );
}