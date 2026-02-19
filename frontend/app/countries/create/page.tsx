"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function LaenderCreatePage() {
  const router = useRouter();
  const [country, setCountry] = useState<string>("");

  const handleSave = async () => {
    try {
      const resp = await fetch("http://localhost/laender.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      router.push("/countries");
    } catch (e: unknown) {
      alert("Fehler beim Erstellen: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <h1>Neues Land</h1>

        <div className="form-grid">
          <label className="full-width">
            Landname
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="z.B. Schweiz"
            />
          </label>
        </div>

        <div className="modal-buttons">
          <button onClick={() => router.push("/countries")}>Abbrechen</button>
          <button onClick={handleSave}>Erstellen</button>
        </div>
      </main>
    </>
  );
}