"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";

export default function LaenderEditPage({ params }: { params: unknown }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { id } = React.use(params as any) as { id: string };
  const router = useRouter();
  const [country, setCountry] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost/laender.php?id_country=${encodeURIComponent(id)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const c = Array.isArray(data) ? data[0] : data;
        setCountry(c.country ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      const resp = await fetch(`http://localhost/laender.php?id_country=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_country: Number(id), country }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      router.push("/countries");
    } catch (e: unknown) {
      alert("Fehler beim Speichern: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <h1>Land bearbeiten</h1>
        {loading && <p>Lade Daten…</p>}
        {error && <p>Fehler: {error}</p>}

        <div className="form-grid">
          <label className="full-width">
            Landname
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </label>
        </div>

        <div className="modal-buttons">
          <button onClick={() => router.push("/countries")}>Abbrechen</button>
          <button onClick={handleSave}>Speichern</button>
        </div>
      </main>
    </>
  );
}