'use client';

import React from 'react'

type RecentLearner = { id: number | null; name: string }
type UpcomingCourse = { id: number | null; kursnummer?: string; kursthema?: string; startdatum?: string }
type TopCourse = { kursId: number | string; count: number; kursnummer?: string; kursthema?: string; avgNote?: number | null }

export default function HomeDashboard({ recentLearners, upcomingCourses, topCourses }: {
  recentLearners: RecentLearner[],
  upcomingCourses: UpcomingCourse[],
  topCourses: TopCourse[],
}) {
  return (
    <section className="home-details">
      <div className="details-column">
        <h2>Neueste Lernende</h2>
        <div className="card">
          <ul className="list-plain">
            {recentLearners.length === 0 && <li className="list-item">Keine Daten</li>}
            {recentLearners.map((r) => (
              <li key={r.id ?? Math.random()} className="list-item">
                <div className="item-title">{r.name || '—'}</div>
                <div className="item-meta">ID: {r.id}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="details-column">
        <h2>Nächste Kurse</h2>
        <div className="card">
          <ul className="list-plain">
            {upcomingCourses.length === 0 && <li className="list-item">Keine bevorstehenden Kurse</li>}
            {upcomingCourses.map((c) => (
              <li key={c.id ?? Math.random()} className="list-item">
                <div className="item-title">{c.kursnummer ? `${c.kursnummer} — ${c.kursthema ?? ''}` : (c.kursthema ?? '—')}</div>
                <div className="item-meta">Start: {c.startdatum ? new Date(c.startdatum).toLocaleDateString() : '—'}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="details-column">
        <h2>Kurse mit den meisten Teilnehmenden</h2>
        <div className="card">
          <ul className="list-plain">
            {topCourses.length === 0 && <li className="list-item">Keine Daten</li>}
            {topCourses.map((t) => (
              <li key={String(t.kursId)} className="list-item">
                <div className="item-title">{t.kursnummer ? `${t.kursnummer} — ${t.kursthema ?? ''}` : (t.kursthema ?? '—')}</div>
                <div className="item-meta">Teilnehmende: {t.count}{t.avgNote != null ? ` • Durchschnitt: ${t.avgNote.toFixed(2)}` : ''}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
