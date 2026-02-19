'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Globe, GraduationCap, BookOpen, Users, Building2, Briefcase, User } from "lucide-react"
import HomeDashboard from './components/HomeDashboard';
import Navbar from './components/Navbar';

// Startseite mit Statistikübersicht und kleinem Dashboard
export default function HomePage() {
  // Zustände für Anzahl der Einträge in den Haupttabellen
  const [stats, setStats] = useState({ dozenten: 0, kurse: 0, lernende: 0, lehrbetriebe: 0 });
  const [loading, setLoading] = useState(true);

  // Dashboard-Daten
  const [recentLearners, setRecentLearners] = useState<any[]>([]);
  const [upcomingCourses, setUpcomingCourses] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Hauptdaten parallel laden
        const [dozentenRes, kurseRes, lernendeRes, lehrbetriebRes, kurseLernendeRes] = await Promise.all([
          fetch('http://localhost/dozenten.php?all=true'),
          fetch('http://localhost/kurse.php?all=true'),
          fetch('http://localhost/lernende.php?all=true'),
          fetch('http://localhost/lehrbetriebe.php?all=true'),
          fetch('http://localhost/kurse_lernende.php?all=true'),
        ]);

        const dozentenData = await dozentenRes.json();
        const kurseData = await kurseRes.json();
        const lernendeData = await lernendeRes.json();
        const lehrbetriebData = await lehrbetriebRes.json();
        const kurseLernendeData = await kurseLernendeRes.json();

        setStats({
          dozenten: Array.isArray(dozentenData) ? dozentenData.length : 0,
          kurse: Array.isArray(kurseData) ? kurseData.length : 0,
          lernende: Array.isArray(lernendeData) ? lernendeData.length : 0,
          lehrbetriebe: Array.isArray(lehrbetriebData) ? lehrbetriebData.length : 0,
        });

        // Neueste Lernende (nach id absteigend)
        if (Array.isArray(lernendeData)) {
          const recent = [...lernendeData]
            .sort((a: any, b: any) => (Number(b.id ?? b.id_lernende ?? 0) - Number(a.id ?? a.id_lernende ?? 0)))
            .slice(0, 5)
            .map((l: any) => ({ id: l.id ?? l.id_lernende ?? null, name: ((l.vorname ?? '') + ' ' + (l.nachname ?? '')).trim() }));
          setRecentLearners(recent);
        }

        // Nächste Kurse (startdatum in der Zukunft, sortiert aufsteigend)
        if (Array.isArray(kurseData)) {
          const today = new Date();
          const upcoming = (kurseData as any[])
            .filter(c => c.startdatum && !isNaN(Date.parse(c.startdatum)) && new Date(c.startdatum) >= today)
            .sort((a, b) => new Date(a.startdatum).getTime() - new Date(b.startdatum).getTime())
            .slice(0, 5)
            .map(c => ({ id: c.id_kurs ?? c.id, kursnummer: c.kursnummer, kursthema: c.kursthema, startdatum: c.startdatum }));
          setUpcomingCourses(upcoming);
        }

        // Top Kurse nach Teilnehmerzahl + Durchschnittsnote falls vorhanden
        if (Array.isArray(kurseLernendeData) && Array.isArray(kurseData)) {
          const counts = new Map<number|string, number>();
          const noteSums = new Map<number|string, { sum: number; n: number }>();
          kurseLernendeData.forEach((r: any) => {
            const k = r.nr_kurs ?? r.id_kurs ?? r.nr_kurs;
            if (k == null) return;
            counts.set(k, (counts.get(k) ?? 0) + 1);
            const note = r.note != null && r.note !== '' ? Number(r.note) : NaN;
            if (!isNaN(note)) {
              const cur = noteSums.get(k) ?? { sum: 0, n: 0 };
              cur.sum += note;
              cur.n += 1;
              noteSums.set(k, cur);
            }
          });

          const top = Array.from(counts.entries())
            .map(([kursId, cnt]) => {
              const kurs = (kurseData as any[]).find((x: any) => Number(x.id_kurs ?? x.id) === Number(kursId)) || {};
              const ns = noteSums.get(kursId);
              const avgNote = ns && ns.n > 0 ? ns.sum / ns.n : null;
              return { kursId, count: cnt, kursnummer: kurs.kursnummer, kursthema: kurs.kursthema, avgNote };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
          setTopCourses(top);
        }

      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Konfiguration der Statistikkarten
  const statCards = [
    { label: 'Lehrbetriebe', value: stats.lehrbetriebe, icon: Building2, href: '/lehrbetriebe'},
    { label: 'Lernende', value: stats.lernende, icon: User, href: '/lernende'},
    { label: 'Kurse', value: stats.kurse, icon: BookOpen, href: '/kurse'},
    { label: 'Dozenten', value: stats.dozenten, icon: GraduationCap, href: '/dozenten'},
  ];

  return (
    <>
      <Navbar />
      <main>
        <div className="stats-grid">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Link key={i} href={stat.href}>
                <div className="stat-card">
                  <Icon size={32}/>
                  <div className="stat-value">
                    {loading ? '...' : stat.value}
                  </div>
                  <div className="stat-label">
                    {stat.label}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Dashboard-Bereich unter den Statistikkarten */}
        <HomeDashboard recentLearners={recentLearners} upcomingCourses={upcomingCourses} topCourses={topCourses} />
      </main>
    </>
  );
}