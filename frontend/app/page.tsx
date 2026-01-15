import Link from 'next/link';
import { Globe, GraduationCap, BookOpen, Users, Building2, Briefcase, User } from "lucide-react"

export default function HomePage() {
  return (
    <main>
      <h1>Willkommen zur Kursverwaltung</h1>
      <Link href="/lehrbetriebe">
        <button>
          <Building2 className="icon" />
          Lehrbetriebe
        </button>
      </Link>
      <Link href="/lehrbetriebe_lernende">
        <button>
          <Briefcase className="icon" />
          Lehrbetriebe & Lernende
        </button>
      </Link>
      <Link href="/lernende">
        <button>
          <User className="icon" />
          Lernende
        </button>
      </Link>
      <Link href="/countries">
        <button>
          <Globe className="icon" />
          Länder
        </button>
      </Link>
      <Link href="/kurse_lernende">
        <button>
          <Users className="icon" />
          Kurse & Lernende
        </button>
      </Link>
      <Link href="/kurse">
        <button>
          <BookOpen className="icon" />
          Kurse
        </button>
      </Link>
      <Link href="/dozenten">
        <button>
          <GraduationCap className="icon" />
          Dozenten
        </button>
      </Link>
    </main>
  );
}