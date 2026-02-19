"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

type DozentForm = {
  vorname?: string;
  nachname?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  nr_land?: number | string;
  geschlecht?: string;
  telefon?: string;
  handy?: string;
  email?: string;
  birthdate?: string;
};

type Country = {
  id_country?: number;
  id?: number;
  country?: string;
  [key: string]: unknown;
};

export default function DozentCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<DozentForm>({
    vorname: "", nachname: "", strasse: "", plz: "", ort: "",
    nr_land: "", geschlecht: "", telefon: "", handy: "", email: "", birthdate: "",
  });
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    fetch("http://localhost/laender.php?all=true")
      .then((r) => r.ok ? r.json() : [])
      .then((json) => setCountries(Array.isArray(json) ? json : []))
      .catch(() => setCountries([]));
  }, []);

  const handleSave = async () => {
    try {
      const resp = await fetch("http://localhost/dozenten.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!resp.ok) throw new Error(await resp.text());
      router.push("/dozenten");
    } catch (e: unknown) {
      alert("Fehler beim Erstellen: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <h1>Neuer Dozent</h1>

        <div className="form-grid">
          <label>
            Vorname
            <input value={form.vorname || ""} onChange={(e) => setForm((f) => ({ ...f, vorname: e.target.value }))} />
          </label>
          <label>
            Nachname
            <input value={form.nachname || ""} onChange={(e) => setForm((f) => ({ ...f, nachname: e.target.value }))} />
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
          <label>
            Land
            <select
              value={String(form.nr_land ?? "")}
              onChange={(e) => setForm((f) => ({ ...f, nr_land: e.target.value === "" ? "" : Number(e.target.value) }))}
            >
              <option value="">Bitte wählen</option>
              {countries.map((c, idx) => (
                <option key={c.id_country ?? c.id ?? idx} value={String(c.id_country ?? c.id ?? "")}>
                  {c.country}
                </option>
              ))}
            </select>
          </label>
          <label>
            Geschlecht
            <select value={form.geschlecht || ""} onChange={(e) => setForm((f) => ({ ...f, geschlecht: e.target.value }))}>
              <option value="">Bitte wählen</option>
              <option value="m">Männlich</option>
              <option value="w">Weiblich</option>
              <option value="d">Divers</option>
            </select>
          </label>
          <label>
            Telefon
            <input value={form.telefon || ""} onChange={(e) => setForm((f) => ({ ...f, telefon: e.target.value }))} />
          </label>
          <label>
            Handy
            <input value={form.handy || ""} onChange={(e) => setForm((f) => ({ ...f, handy: e.target.value }))} />
          </label>
          <label className="full-width">
            E-Mail
            <input type="email" value={form.email || ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </label>
          <label className="full-width">
            Geburtsdatum
            <input type="date" value={form.birthdate || ""} onChange={(e) => setForm((f) => ({ ...f, birthdate: e.target.value }))} />
          </label>
        </div>

        <div className="modal-buttons">
          <button onClick={() => router.push("/dozenten")}>Abbrechen</button>
          <button onClick={handleSave}>Erstellen</button>
        </div>
      </main>
    </>
  );
}