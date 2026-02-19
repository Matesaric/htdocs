"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";

type Lernender = {
  id_lernende?: number;
  vorname?: string;
  nachname?: string;
  email?: string;
  ort?: string;
  land_name?: string;
  nr_land?: number | string;
  [key: string]: unknown;
};

export default function LernendeDeletePage({ params }: { params: unknown }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { id } = React.use(params as any) as { id: string };
  const router = useRouter();
  const [lernender, setLernender] = useState<Lernender | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost/lernende.php?id_lernende=${encodeURIComponent(id)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setLernender(Array.isArray(data) ? data[0] : data))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConfirm = async () => {
    try {
      const resp = await fetch(`http://localhost/lernende.php?id_lernende=${id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error(await resp.text());
      router.push("/lernende");
    } catch (e: unknown) {
      alert("Fehler beim Löschen: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <h1>Lernenden löschen</h1>
        {loading && <p>Lade Daten…</p>}
        {error && <p>Fehler: {error}</p>}

        {lernender && (
          <div className="delete-info">
            <h4>Lernender-Informationen:</h4>
            <div className="delete-info-field">
              <strong>Name:</strong>{" "}
              {`${lernender.vorname ?? ""} ${lernender.nachname ?? ""}`.trim() || "-"}
            </div>
            <div className="delete-info-field">
              <strong>E-Mail:</strong> {lernender.email ?? "-"}
            </div>
            <div className="delete-info-field">
              <strong>Ort:</strong> {lernender.ort ?? "-"}
            </div>
            <div className="delete-info-field">
              <strong>Land:</strong> {lernender.land_name ?? lernender.nr_land ?? "-"}
            </div>
            <div className="delete-info-field">
              <strong>ID:</strong> {lernender.id_lernende ?? id}
            </div>
          </div>
        )}

        <p style={{ color: "#666", fontSize: "13px", marginTop: "12px" }}>
          Diese Aktion kann nicht rückgängig gemacht werden.
        </p>

        <div className="modal-buttons">
          <button onClick={() => router.push("/lernende")}>Abbrechen</button>
          <button className="delete-confirm-btn" onClick={handleConfirm}>
            Ja, löschen
          </button>
        </div>
      </main>
    </>
  );
}