/* ──────────────────────────────────────────────
   Reservations Page — Upcoming & Past
   Ported from Stitch "Reservations List – State A"
   ────────────────────────────────────────────── */

import { useState } from 'react'

type Reservation = {
  id: number
  station: string
  address: string
  date: string
  time: string
  duration: string
  status: 'Confirmed' | 'Completed' | 'Cancelled'
  connector: string
}

const upcomingData: Reservation[] = [
  {
    id: 1,
    station: 'DTLA Grand Ave',
    address: '350 S Grand Ave, Los Angeles',
    date: '26 MAR 2026',
    time: '10:00 AM',
    duration: '45 min',
    status: 'Confirmed',
    connector: 'V3 · Stall #4',
  },
  {
    id: 2,
    station: 'Santa Monica V3',
    address: '1234 Ocean Ave, Santa Monica',
    date: '29 MAR 2026',
    time: '2:30 PM',
    duration: '30 min',
    status: 'Confirmed',
    connector: 'V3 · Stall #7',
  },
]

const pastData: Reservation[] = [
  {
    id: 3,
    station: 'Culver City North',
    address: '9000 Culver Blvd, Culver City',
    date: '18 MAR 2026',
    time: '11:15 AM',
    duration: '38 min',
    status: 'Completed',
    connector: 'V3 · Stall #2',
  },
  {
    id: 4,
    station: 'Malibu Beach',
    address: '22000 PCH, Malibu',
    date: '14 MAR 2026',
    time: '4:00 PM',
    duration: '55 min',
    status: 'Completed',
    connector: 'V2 · Stall #11',
  },
  {
    id: 5,
    station: 'Echo Park East',
    address: '1500 Echo Park Ave',
    date: '10 MAR 2026',
    time: '9:00 AM',
    duration: '25 min',
    status: 'Cancelled',
    connector: 'V3 · Stall #1',
  },
]

const statusStyles: Record<string, string> = {
  Confirmed: 'bg-[#4CAF50]/15 text-[#4CAF50]',
  Completed: 'bg-tertiary/15 text-tertiary',
  Cancelled: 'bg-error/15 text-error',
}

export default function Reservations() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const items = tab === 'upcoming' ? upcomingData : pastData

  return (
    <>
      {/* ── Header ── */}
      <div className="sticky top-0 z-50 bg-[#131313] px-6 pt-4 pb-3">
        <h1 className="font-headline text-[1.5rem] font-bold tracking-tight">Reservations</h1>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 px-6 mt-2">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 text-[0.6875rem] font-bold uppercase tracking-widest rounded-sm transition-all ${
              tab === t
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-surface-container text-on-surface-variant hover:text-primary'
            }`}
          >
            {t === 'upcoming' ? `Upcoming (${upcomingData.length})` : `Past (${pastData.length})`}
          </button>
        ))}
      </div>

      {/* ── Reservation cards ── */}
      <div className="px-6 mt-6 space-y-4 pb-4">
        {items.map((res) => (
          <div key={res.id} className="bg-surface-container rounded-lg p-5 space-y-4">
            {/* Top row */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base">{res.station}</h3>
                <p className="text-xs text-on-surface-variant/60 mt-0.5">{res.address}</p>
              </div>
              <span
                className={`text-[0.6875rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm ${
                  statusStyles[res.status]
                }`}
              >
                {res.status}
              </span>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Date', value: res.date },
                { label: 'Time', value: res.time },
                { label: 'Duration', value: res.duration },
              ].map((d) => (
                <div key={d.label} className="flex flex-col">
                  <span className="text-[0.6875rem] uppercase font-bold text-on-surface-variant/40">
                    {d.label}
                  </span>
                  <span className="font-semibold text-sm mt-0.5">{d.value}</span>
                </div>
              ))}
            </div>

            {/* Connector badge + actions */}
            <div className="flex items-center justify-between">
              <span className="text-[0.6875rem] font-bold text-on-surface-variant/40 bg-surface-container-highest px-3 py-1 rounded-sm">
                {res.connector}
              </span>
              {res.status === 'Confirmed' && (
                <div className="flex gap-2">
                  <button className="text-[0.6875rem] font-bold uppercase tracking-widest text-error hover:underline">
                    Cancel
                  </button>
                  <button className="bg-primary-container px-4 py-1.5 text-on-primary-container text-[0.6875rem] font-black uppercase tracking-[0.1em] rounded-sm hover:opacity-90 transition-opacity active:scale-95">
                    Details
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
