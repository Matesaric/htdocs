"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";

type KurseLernende = {
  id_kurse_lernende?: number;
  kurs_titel?: string;
  kursnummer?: string;
  lernende_name?: string;
  nr_kurs?: number | string;
  nr_lernende?: number | string;
  note?: number | string;
  [key: string]: unknown;
};

export default function KurseLernendeDeletePage({ params }: { params: unknown }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { id } = React.use(params as any) as { id: string };
  const router = useRouter();
  const [eintrag, setEintrag] = useState<KurseLernende | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost/kurse_lernende.php?id_kurse_lernende=${encodeURIComponent(id)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setEintrag(Array.isArray(data) ? data[0] : data))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConfirm = async () => {
    try {
      const resp = await fetch(
        `http://localhost/kurse_lernende.php?id_kurse_lernende=${id}`,
        { method: "DELETE" }
      );
      if (!resp.ok) throw new Error(await resp.text());
      router.push("/kurse_lernende");
    } catch (e: unknown) {
      alert("Fehler beim Löschen: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <h1>Zuweisung löschen</h1>
        {loading && <p>Lade Daten…</p>}
        {error && <p>Fehler: {error}</p>}

        {eintrag && (
          <div className="delete-info">
            <h4>Zuweisungs-Informationen:</h4>
            <div className="delete-info-field">
              <strong>Kursnummer:</strong> {eintrag.kursnummer ?? "-"}
            </div>
            <div className="delete-info-field">
              <strong>Kurs:</strong> {eintrag.kurs_titel ?? eintrag.nr_kurs ?? "-"}
            </div>
            <div className="delete-info-field">
              <strong>Lernender:</strong> {eintrag.lernende_name ?? eintrag.nr_lernende ?? "-"}
            </div>
            <div className="delete-info-field">
              <strong>Note:</strong> {eintrag.note ?? "-"}
            </div>
            <div className="delete-info-field">
              <strong>ID:</strong> {eintrag.id_kurse_lernende ?? id}
            </div>
          </div>
        )}

        <p style={{ color: "#666", fontSize: "13px", marginTop: "12px" }}>
          Diese Aktion kann nicht rückgängig gemacht werden.
        </p>

        <div className="modal-buttons">
          <button onClick={() => router.push("/kurse_lernende")}>Abbrechen</button>
          <button className="delete-confirm-btn" onClick={handleConfirm}>
            Ja, löschen
          </button>
        </div>
      </main>
    </>
  );
}