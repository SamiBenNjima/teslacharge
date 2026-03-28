/* ──────────────────────────────────────────────
   Map Page — Nearby Superchargers
   Ported from Stitch "Map Browse – State A"
   ────────────────────────────────────────────── */

import { useState } from 'react'

const stations = [
  {
    id: 1,
    name: 'DTLA Grand Ave Supercharger',
    address: '350 S Grand Ave, Los Angeles, CA',
    distance: '1.2 mi',
    available: 8,
    total: 12,
    speed: '250 kW',
    type: 'V3',
  },
  {
    id: 2,
    name: 'Santa Monica V3 Supercharger',
    address: '1234 Ocean Ave, Santa Monica, CA',
    distance: '3.8 mi',
    available: 4,
    total: 8,
    speed: '250 kW',
    type: 'V3',
  },
  {
    id: 3,
    name: 'Beverly Hills Supercharger',
    address: '9876 Wilshire Blvd, Beverly Hills, CA',
    distance: '5.1 mi',
    available: 2,
    total: 16,
    speed: '150 kW',
    type: 'V2',
  },
  {
    id: 4,
    name: 'Hollywood & Highland',
    address: '6801 Hollywood Blvd, Los Angeles, CA',
    distance: '6.3 mi',
    available: 10,
    total: 10,
    speed: '250 kW',
    type: 'V3',
  },
]

export default function MapPage() {
  const [search, setSearch] = useState('')

  const filtered = stations.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <>
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-50 bg-[#131313] px-6 pt-4 pb-3 space-y-4">
        <h1 className="font-headline text-[1.5rem] font-bold tracking-tight">
          Find a Charger
        </h1>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Search stations, cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest text-on-surface pl-10 pr-4 py-3 rounded-lg text-sm font-medium placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary-container/50 transition-all"
          />
        </div>
      </div>

      {/* ── Map placeholder ── */}
      <div className="mx-6 mt-2 rounded-xl overflow-hidden bg-surface-container-low h-56 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-container-low to-surface-container opacity-80" />
        <div className="relative z-10 flex flex-col items-center gap-2 text-on-surface-variant/60">
          <span className="material-symbols-outlined text-4xl text-primary-container/60">map</span>
          <span className="text-xs font-bold uppercase tracking-widest">Map View</span>
          <span className="text-[0.6875rem] text-on-surface-variant/40">Interactive map coming soon</span>
        </div>
        {/* pulsing dot to simulate activity */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 bg-primary-container rounded-full animate-ping opacity-40" />
          <div className="w-3 h-3 bg-primary-container rounded-full absolute inset-0" />
        </div>
      </div>

      {/* ── Filter chips ── */}
      <div className="flex gap-2 px-6 mt-4 overflow-x-auto hide-scrollbar pb-1">
        {['All', 'V3 250 kW', 'V2 150 kW', 'Available Now'].map((chip, i) => (
          <button
            key={chip}
            className={`whitespace-nowrap px-4 py-1.5 rounded-sm text-[0.6875rem] font-bold uppercase tracking-widest transition-all ${
              i === 0
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-surface-container text-on-surface-variant hover:text-primary'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* ── Station list ── */}
      <div className="px-6 mt-6 space-y-3 pb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/50">
          Nearby Stations
        </h3>
        {filtered.map((station) => {
          const ratio = station.available / station.total
          const statusColor = ratio > 0.5 ? '#4CAF50' : ratio > 0.15 ? '#FFC107' : '#F44336'

          return (
            <div
              key={station.id}
              className="bg-surface-container p-5 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1">
                  <h4 className="font-bold text-base">{station.name}</h4>
                  <p className="text-xs text-on-surface-variant/60">{station.address}</p>
                </div>
                <span className="text-xs font-bold text-on-surface-variant/50 ml-4 whitespace-nowrap">
                  {station.distance}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
                    <span
                      className="text-[0.6875rem] font-bold uppercase tracking-wider"
                      style={{ color: statusColor }}
                    >
                      {station.available} / {station.total}
                    </span>
                  </div>
                  <span className="text-[0.6875rem] font-bold text-on-surface-variant/40 bg-surface-container-highest px-2 py-0.5 rounded-sm">
                    {station.type} · {station.speed}
                  </span>
                </div>
                <button className="bg-primary-container px-4 py-1.5 text-on-primary-container text-[0.6875rem] font-black uppercase tracking-[0.1em] rounded-sm hover:opacity-90 transition-opacity active:scale-95">
                  Book
                </button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-on-surface-variant/40 text-sm">
            No stations match your search.
          </div>
        )}
      </div>
    </>
  )
}
