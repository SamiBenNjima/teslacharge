/* ──────────────────────────────────────────────
   Home Page — TeslaCharge Dashboard
   Ported from Stitch "TeslaCharge Home – Standard Dark"
   ────────────────────────────────────────────── */

export default function Home() {
  return (
    <>
      {/* ── Top App Bar ── */}
      <nav className="flex justify-between items-center px-6 py-4 w-full bg-[#131313] top-0 sticky z-50">
        <div className="flex flex-col">
          <h1 className="font-headline text-[1.5rem] tracking-tight font-bold text-[#e2e2e2]">
            Good morning, Karim
          </h1>
          <span className="text-on-surface-variant/60 text-sm font-medium">
            Monday, 24 March 2026
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:opacity-80 transition-opacity active:scale-95 duration-200">
            <span className="material-symbols-outlined text-[#ffb4ac]">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4kdDFwj3ZhkeZPYil23Tltp-80fdSD8otL2L7ivRmfnRZ28Ul2L0Yu8A4L9bTa0U_D66iS9f7V6ncZQUrZlsxNUU4TJ7_V6Kx-F6QAiPm14tHemMWQveFyf_UzSULfqAU4kAsgNL651QT7jyle8Guw9oZkYZliowuZyRFcXNZIDsFB9vJdL3Q86MjFUQPsAF_VzKStWjoX4BtG54pXuzMBLyvSZWF_F9c7rdNvJBK3XyfC0cc2Zfpu3VZPKp4IZAwx0nfkm26HII"
              alt="User avatar"
            />
          </div>
        </div>
      </nav>

      <main className="px-6 space-y-8 max-w-5xl mx-auto mt-4">
        {/* ── Upcoming reservation banner ── */}
        <div className="bg-primary-container/10 border-l-4 border-primary-container p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-container">event_available</span>
            <span className="text-sm font-semibold tracking-wide">Next charge in 2 days</span>
          </div>
          <button className="text-xs uppercase font-bold tracking-widest text-primary-container">
            View Details
          </button>
        </div>

        {/* ── Active Vehicle Card ── */}
        <section className="relative overflow-hidden bg-surface-container rounded-xl p-8">
          <div className="flex flex-col md:flex-row justify-between relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-surface-container-highest px-3 py-1 text-[0.6875rem] font-bold tracking-widest rounded-sm text-on-surface-variant">
                  #A4F2
                </span>
                <span className="bg-surface-container-highest px-3 py-1 text-[0.6875rem] font-bold tracking-widest rounded-sm text-on-surface-variant">
                  NACS
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold tracking-tighter">Model 3 Long Range</h2>
                <button className="text-primary text-xs font-bold uppercase tracking-widest mt-1 hover:underline">
                  Switch vehicle
                </button>
              </div>
              <div className="flex items-end gap-2 pt-4">
                <span className="text-[3.5rem] font-black leading-none tracking-tighter">78</span>
                <span className="text-lg font-bold text-on-surface-variant mb-2">%</span>
                <span
                  className="material-symbols-outlined text-primary-container mb-3"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  battery_charging_80
                </span>
              </div>
            </div>
            <div className="mt-8 md:mt-0 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 w-full md:w-3/5 pointer-events-none">
              <img
                className="w-full object-contain transform scale-110 translate-x-12"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3NS6FsxKAd8cXKTqMcRzlzrfY8ftwKVi6qTxqfgi3us6X2mD8lPayD-EYtUJ_tNgp2Li43Awq46g456nF5357az3RNUSA5QENNbJJfe12JRqpwjgZFTQddHDPpuW_dyQXD2NIo503lt8wHyw6Y4zTEyMm_8LrYgyN0afnOYB3eHbuzDV1wa25ByXF78rauDvF5vBtM61wx93BmoU-zVmijwxyLZtN-8pFIfx2i0j1VbzSGXQpbIjpK4L_zzA0HrwF1cyx_hbj-fY"
                alt="Tesla Model 3 side profile"
              />
            </div>
          </div>
        </section>

        {/* ── Quick Stats ── */}
        <section className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Sessions', value: '12' },
            { label: 'Energy Usage', value: '187', unit: 'kWh' },
            { label: 'CO2 Saved', value: '28', unit: 'kg' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-surface-container-low p-5 rounded-lg border-b-2 border-transparent hover:border-primary-container transition-all"
            >
              <span className="text-[0.6875rem] uppercase tracking-widest font-bold text-on-surface-variant/50">
                {s.label}
              </span>
              <div className="text-2xl font-bold mt-1">
                {s.value}
                {s.unit && (
                  <span className="text-xs font-medium text-on-surface-variant"> {s.unit}</span>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* ── Recent Sessions ── */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="text-lg font-bold tracking-tight">Recent Sessions</h3>
            <button className="text-xs font-bold text-primary-container uppercase tracking-widest">
              View History
            </button>
          </div>
          <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-2">
            {[
              { station: 'Santa Monica V3', date: '21 MAR', energy: '42.5 kWh', cost: '$18.90' },
              { station: 'Culver City North', date: '18 MAR', energy: '31.2 kWh', cost: '$14.04' },
              { station: 'Malibu Beach', date: '14 MAR', energy: '55.8 kWh', cost: '$25.11' },
            ].map((sess) => (
              <div
                key={sess.station}
                className="min-w-[280px] bg-surface-container p-5 rounded-lg space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold">{sess.station}</div>
                  <span className="text-[0.6875rem] text-on-surface-variant/60 font-medium">
                    {sess.date}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[0.6875rem] uppercase font-bold text-on-surface-variant/40">
                      Energy
                    </span>
                    <span className="font-bold text-primary-container">{sess.energy}</span>
                  </div>
                  <div className="w-px h-8 bg-surface-variant" />
                  <div className="flex flex-col">
                    <span className="text-[0.6875rem] uppercase font-bold text-on-surface-variant/40">
                      Cost
                    </span>
                    <span className="font-bold">{sess.cost}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Favorite Stations ── */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold tracking-tight">Favorite Stations</h3>
          <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-4">
            {[
              { name: 'DTLA Grand Ave', city: 'Los Angeles, CA', avail: '8 / 12', color: '#4CAF50' },
              { name: 'Beverly Hills', city: 'Beverly Hills, CA', avail: '2 / 16', color: '#FFC107' },
              { name: 'Echo Park East', city: 'Los Angeles, CA', avail: '12 / 12', color: '#4CAF50' },
            ].map((st) => (
              <div
                key={st.name}
                className="min-w-[240px] bg-surface-container p-5 rounded-lg flex flex-col justify-between h-44"
              >
                <div>
                  <div className="flex justify-between">
                    <h4 className="font-bold text-base">{st.name}</h4>
                    <span
                      className="material-symbols-outlined text-primary-container text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">{st.city}</p>
                  <div className="flex items-center mt-3 gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                    <span
                      className="text-[0.6875rem] font-bold uppercase tracking-wider"
                      style={{ color: st.color }}
                    >
                      {st.avail} Available
                    </span>
                  </div>
                </div>
                <button className="w-full bg-primary-container py-2 text-on-primary-container text-[0.6875rem] font-black uppercase tracking-[0.1em] rounded-sm hover:opacity-90 transition-opacity active:scale-95">
                  Book
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
