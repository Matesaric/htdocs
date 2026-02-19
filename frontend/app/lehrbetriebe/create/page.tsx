"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

type LehrbetriebForm = {
  firma?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
};

export default function LehrbetriebCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<LehrbetriebForm>({
    firma: "", strasse: "", plz: "", ort: "",
  });

  const handleSave = async () => {
    try {
      const resp = await fetch("http://localhost/lehrbetriebe.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!resp.ok) throw new Error(await resp.text());
      router.push("/lehrbetriebe");
    } catch (e: unknown) {
      alert("Fehler beim Erstellen: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <h1>Neuer Lehrbetrieb</h1>

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
          <button onClick={handleSave}>Erstellen</button>
        </div>
      </main>
    </>
  );
}