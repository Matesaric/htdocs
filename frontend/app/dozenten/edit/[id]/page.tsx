"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";

type DozentForm = {
  id_dozent?: number;
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

export default function DozentEditPage({ params }: { params: unknown }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { id } = React.use(params as any) as { id: string };
  const router = useRouter();
  const [form, setForm] = useState<DozentForm>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    // Länder laden
    fetch("http://localhost/laender.php?all=true")
      .then((r) => r.ok ? r.json() : [])
      .then((json) => setCountries(Array.isArray(json) ? json : []))
      .catch(() => setCountries([]));

    // Dozent laden
    setLoading(true);
    fetch(`http://localhost/dozenten.php?id_dozent=${encodeURIComponent(id)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const d = Array.isArray(data) ? data[0] : data;
        setForm({
          id_dozent: d.id_dozent ?? d.id,
          vorname:   d.vorname   ?? "",
          nachname:  d.nachname  ?? "",
          strasse:   d.strasse   ?? "",
          plz:       d.plz       ?? "",
          ort:       d.ort       ?? "",
          nr_land:   d.nr_land   ?? "",
          geschlecht:d.geschlecht?? "",
          telefon:   d.telefon   ?? "",
          handy:     d.handy     ?? "",
          email:     d.email     ?? "",
          birthdate: d.birthdate ?? "",
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      const resp = await fetch(`http://localhost/dozenten.php?id_dozent=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_dozent: Number(id), ...form }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      router.push("/dozenten");
    } catch (e: unknown) {
      alert("Fehler beim Speichern: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <h1>Dozent bearbeiten</h1>
        {loading && <p>Lade Daten…</p>}
        {error && <p>Fehler: {error}</p>}

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
          <button onClick={handleSave}>Speichern</button>
        </div>
      </main>
    </>
  );
}