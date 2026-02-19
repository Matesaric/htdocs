"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";

type Lehrbetrieb = {
  id_lehrbetrieb?: number;
  firma?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  [key: string]: unknown;
};

export default function LehrbetriebDeletePage({ params }: { params: unknown }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { id } = React.use(params as any) as { id: string };
  const router = useRouter();
  const [lehrbetrieb, setLehrbetrieb] = useState<Lehrbetrieb | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost/lehrbetriebe.php?id_lehrbetrieb=${encodeURIComponent(id)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setLehrbetrieb(Array.isArray(data) ? data[0] : data))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConfirm = async () => {
    try {
      const resp = await fetch(`http://localhost/lehrbetriebe.php?id_lehrbetrieb=${id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error(await resp.text());
      router.push("/lehrbetriebe");
    } catch (e: unknown) {
      alert("Fehler beim Löschen: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <h1>Lehrbetrieb löschen</h1>
        {loading && <p>Lade Daten…</p>}
        {error && <p>Fehler: {error}</p>}

        {lehrbetrieb && (
          <div className="delete-info">
            <h4>Lehrbetrieb-Informationen:</h4>
            <div className="delete-info-field">
              <strong>Firma:</strong> {lehrbetrieb.firma ?? "-"}
            </div>
            <div className="delete-info-field">
              <strong>Strasse:</strong> {lehrbetrieb.strasse ?? "-"}
            </div>
            <div className="delete-info-field">
              <strong>PLZ / Ort:</strong> {`${lehrbetrieb.plz ?? ""} ${lehrbetrieb.ort ?? ""}`.trim() || "-"}
            </div>
            <div className="delete-info-field">
              <strong>ID:</strong> {lehrbetrieb.id_lehrbetrieb ?? id}
            </div>
          </div>
        )}

        <p style={{ color: "#666", fontSize: "13px", marginTop: "12px" }}>
          Diese Aktion kann nicht rückgängig gemacht werden.
        </p>

        <div className="modal-buttons">
          <button onClick={() => router.push("/lehrbetriebe")}>Abbrechen</button>
          <button className="delete-confirm-btn" onClick={handleConfirm}>
            Ja, löschen
          </button>
        </div>
      </main>
    </>
  );
}