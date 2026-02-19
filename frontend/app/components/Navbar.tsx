'use client';

// Navigationsleiste mit Links zu den Hauptseiten der Anwendung
// Aktiver Eintrag wird hervorgehoben mittels `usePathname` aus next/navigation

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, GraduationCap, BookOpen, Users, Building2, Briefcase, User } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname();

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
        <Link href="/">
          <h2 className="nav-title">{getPageTitle()}</h2>
        </Link>
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
      </div>
    </nav>
  );
}
