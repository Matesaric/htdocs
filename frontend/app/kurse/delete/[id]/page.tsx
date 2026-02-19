"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";

export default function KursDeletePage({ params }: { params: unknown }) {
  // unwrap params promise
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { id } = React.use(params as any) as { id: string };
  const router = useRouter();

  type Kurs = {
    id_kurs?: number;
    kursnummer?: string;
    kursthema?: string;
    [key: string]: unknown;
  };

  const [kurs, setKurs] = useState<Kurs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost/kurse.php?id_kurs=${encodeURIComponent(id)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setKurs(Array.isArray(data) ? data[0] : data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConfirm = async () => {
    try {
      const resp = await fetch(`http://localhost/kurse.php?id_kurs=${id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error(await resp.text());
      router.push("/kurse");
    } catch (e: unknown) {
      alert("Fehler beim Löschen: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <h1>Kurs löschen</h1>
        {loading && <p>Lade Kurs…</p>}
        {error && <p>Fehler: {error}</p>}
        {kurs && (
          <div className="delete-info">
            <div className="delete-info-field">
              <strong>Kursnummer:</strong> {kurs.kursnummer ?? "-"}
            </div>
            <div className="delete-info-field">
              <strong>Thema:</strong> {kurs.kursthema ?? "-"}
            </div>
          </div>
        )}
        <div className="modal-buttons">
          <button onClick={() => router.push("/kurse")}>Abbrechen</button>
          <button className="delete-confirm-btn" onClick={handleConfirm}>
            Löschen
          </button>
        </div>
      </main>
    </>
  );
}
