'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Globe, GraduationCap, BookOpen, Users, Building2, Briefcase, User, Zap, Database, Shield } from "lucide-react"

// Startseite mit Statistikübersicht
export default function HomePage() {
  // Zustände für Anzahl der Einträge in den Haupttabellen
  const [stats, setStats] = useState<{
    dozenten: number;
    kurse: number;
    lernende: number;
    lehrbetriebe: number;
  }>({
    dozenten: 0,
    kurse: 0,
    lernende: 0,
    lehrbetriebe: 0,
  });
  const [loading, setLoading] = useState(true); // zeigt Ladezustand der Statistik an

  // beim Mounten Statistiken parallel abrufen
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dozentenRes, kurseRes, lernendeRes, lehrbetriebRes] = await Promise.all([
          fetch('http://localhost/dozenten.php?all=true'),
          fetch('http://localhost/kurse.php?all=true'),
          fetch('http://localhost/lernende.php?all=true'),
          fetch('http://localhost/lehrbetriebe.php?all=true'),
        ]);

        const dozentenData = await dozentenRes.json();
        const kurseData = await kurseRes.json();
        const lernendeData = await lernendeRes.json();
        const lehrbetriebData = await lehrbetriebRes.json();

        setStats({
          dozenten: Array.isArray(dozentenData) ? dozentenData.length : 0,
          kurse: Array.isArray(kurseData) ? kurseData.length : 0,
          lernende: Array.isArray(lernendeData) ? lernendeData.length : 0,
          lehrbetriebe: Array.isArray(lehrbetriebData) ? lehrbetriebData.length : 0,
        });
      } catch (error) {
        console.error('Fehler beim Abrufen der Statistiken:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Konfiguration der Statistikkarten, die auf der Seite angezeigt werden
  const statCards = [
    { label: 'Lehrbetriebe', value: stats.lehrbetriebe, icon: Building2, href: '/lehrbetriebe'},
    { label: 'Lernende', value: stats.lernende, icon: User, href: '/lernende'},
    { label: 'Kurse', value: stats.kurse, icon: BookOpen, href: '/kurse'},
    { label: 'Dozenten', value: stats.dozenten, icon: GraduationCap, href: '/dozenten'},
  ];

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <h2 className="nav-title">Kursverwaltung</h2>
          <div className="nav-links">
            <Link href="/lehrbetriebe"><button><Building2 className="icon" />Lehrbetriebe</button></Link>
            <Link href="/lehrbetriebe_lernende"><button><Briefcase className="icon" />Lehrbetriebe & Lernende</button></Link>
            <Link href="/lernende"><button><User className="icon" />Lernende</button></Link>
            <Link href="/countries"><button><Globe className="icon" />Länder</button></Link>
            <Link href="/kurse_lernende"><button><Users className="icon" />Kurse & Lernende</button></Link>
            <Link href="/kurse"><button><BookOpen className="icon" />Kurse</button></Link>
            <Link href="/dozenten"><button><GraduationCap className="icon" />Dozenten</button></Link>
          </div>
        </div>
      </nav>
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
      </main>
    </>
  );
}