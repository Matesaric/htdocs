import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <h1>Willkommen zur Kursverwaltung</h1>
      <Link href="/lehrbetriebe">
        <button>Lehrbetriebe</button>
      </Link>
      <Link href="/lehrbetriebe_lernende">
        <button>Lehrbetriebe & Lernende</button>
      </Link>
      <Link href="/lernende">
        <button>Lernende</button>
      </Link>
      <Link href="/countries">
        <button>Länder</button>
      </Link>
      <Link href="/kurse_lernende">
        <button>Kurse & Lernende</button>
      </Link>
      <Link href="/kurse">
        <button>Kurse</button>
      </Link>
      <Link href="/dozenten">
        <button>Dozenten</button>
      </Link>
    </main>
  );
}