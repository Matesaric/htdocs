"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

type LernenderForm = {
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
  email_privat?: string;
  birthdate?: string;
};

type Country = {
  id_country?: number;
  id?: number;
  country?: string;
  [key: string]: unknown;
};

// Bereinigt das birthdate-Feld vor dem Senden
const sanitizeBirthdate = (form: LernenderForm): LernenderForm => {
  const payload = { ...form };
  if (!payload.birthdate || payload.birthdate === "0000-00-00") {
    delete payload.birthdate;
  } else {
    const d = new Date(payload.birthdate);
    if (isNaN(d.getTime())) delete payload.birthdate;
    else payload.birthdate = d.toISOString().slice(0, 10);
  }
  return payload;
};

export default function LernendeCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<LernenderForm>({
    vorname: "", nachname: "", strasse: "", plz: "", ort: "",
    nr_land: "", geschlecht: "", telefon: "", handy: "",
    email: "", email_privat: "", birthdate: "",
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
      const payload = sanitizeBirthdate(form);
      const resp = await fetch("http://localhost/lernende.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error(await resp.text());
      router.push("/lernende");
    } catch (e: unknown) {
      alert("Fehler beim Erstellen: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <h1>Neuer Lernender</h1>

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
            E-Mail Privat
            <input type="email" value={form.email_privat || ""} onChange={(e) => setForm((f) => ({ ...f, email_privat: e.target.value }))} />
          </label>
          <label className="full-width">
            Geburtsdatum
            <input type="date" value={form.birthdate || ""} onChange={(e) => setForm((f) => ({ ...f, birthdate: e.target.value }))} />
          </label>
        </div>

        <div className="modal-buttons">
          <button onClick={() => router.push("/lernende")}>Abbrechen</button>
          <button onClick={handleSave}>Erstellen</button>
        </div>
      </main>
    </>
  );
}