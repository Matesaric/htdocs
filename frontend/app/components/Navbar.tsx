'use client';

// Navigationsleiste mit Links zu den Hauptseiten der Anwendung
// Aktiver Eintrag wird hervorgehoben mittels `usePathname` aus next/navigation

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, GraduationCap, BookOpen, Users, Building2, Briefcase, User, Menu, X } from "lucide-react"
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Definition der Menüpunkte in der Navbar – Label, Ziel und Symbol
  const navItems = [
    { label: 'Lehrbetriebe', href: '/lehrbetriebe', icon: Building2 },
    { label: 'Lehrbetriebe & Lernende', href: '/lehrbetriebe_lernende', icon: Briefcase },
    { label: 'Lernende', href: '/lernende', icon: User },
    { label: 'Länder', href: '/countries', icon: Globe },
    { label: 'Kurse & Lernende', href: '/kurse_lernende', icon: Users },
    { label: 'Kurse', href: '/kurse', icon: BookOpen },
    { label: 'Dozenten', href: '/dozenten', icon: GraduationCap },
  ];

  // Ermittelt den Seitentitel basierend auf dem aktuellen Pfad
  const getPageTitle = () => {
    const item = navItems.find(i => i.href === pathname);
    if (item) return item.label;
    if (pathname === '/') return 'Startseite';
    return 'Kursverwaltung';
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <button className="mobile-hamburger" aria-label="Menü" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <Link href="/">
            <h2 className="nav-title">{getPageTitle()}</h2>
          </Link>
        </div>
        <div className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button className={isActive ? 'active' : ''}>
                  <Icon className="icon" />
                  {item.label}
                </button>
              </Link>
            );
          })}
        </div>
        {/* Mobile sidebar drawer */}
        {open && (
          <div>
            <div className="mobile-overlay" onClick={() => setOpen(false)} />
            <aside className="mobile-sidebar" role="dialog" aria-modal="true">
              <div className="mobile-sidebar-header">
                <h3>{getPageTitle()}</h3>
                <button onClick={() => setOpen(false)} aria-label="Schließen"><X /></button>
              </div>
              <div className="mobile-sidebar-links">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <button className={isActive ? 'active' : ''} onClick={() => setOpen(false)}>
                        <Icon className="icon" /> {item.label}
                      </button>
                    </Link>
                  );
                })}
              </div>
            </aside>
          </div>
        )}
      </div>
    </nav>
  );
}
