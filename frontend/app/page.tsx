import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <h1>Willkommen zur Kursverwaltung</h1>
      <Link href="/lehrbetriebe">
        <button>Lehrbetriebe</button>
      </Link>
      <br></br>
      <Link href="/lehrbetriebe_lernende">
        <button>Lehrbetriebe & Lernende</button>
      </Link>
      <br></br>
      <Link href="/lernende">
        <button>Lernende</button>
      </Link>
      <br></br>
      <Link href="/countries">
        <button>Länder</button>
      </Link>
      <br></br>
      <Link href="/kurse_lernende">
        <button>Kurse & Lernende</button>
      </Link>
      <br></br>
      <Link href="/kurse">
        <button>Kurse</button>
      </Link>
      <br></br>
      <Link href="/dozenten">
        <button>Dozenten</button>
      </Link>
    </main>
  );
}