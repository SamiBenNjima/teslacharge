/* ──────────────────────────────────────────────
   Profile Page — User Settings & Vehicle
   Ported from Stitch "Profile Overview"
   ────────────────────────────────────────────── */

export default function Profile() {
  const menuItems = [
    { icon: 'directions_car', label: 'My Vehicles', desc: 'Manage connected vehicles' },
    { icon: 'credit_card', label: 'Payment Methods', desc: 'Cards & billing info' },
    { icon: 'history', label: 'Charging History', desc: 'Past sessions & receipts' },
    { icon: 'notifications', label: 'Notifications', desc: 'Alert preferences' },
    { icon: 'shield', label: 'Privacy & Security', desc: 'Password & data settings' },
    { icon: 'help', label: 'Help & Support', desc: 'FAQs & contact us' },
  ]

  return (
    <>
      {/* ── Header ── */}
      <div className="sticky top-0 z-50 bg-[#131313] px-6 pt-4 pb-3 flex justify-between items-center">
        <h1 className="font-headline text-[1.5rem] font-bold tracking-tight">Profile</h1>
        <button className="text-xs uppercase font-bold tracking-widest text-primary-container hover:underline">
          Edit
        </button>
      </div>

      <main className="px-6 space-y-8 mt-4 pb-4">
        {/* ── User card ── */}
        <section className="bg-surface-container rounded-xl p-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-container-high flex-shrink-0">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4kdDFwj3ZhkeZPYil23Tltp-80fdSD8otL2L7ivRmfnRZ28Ul2L0Yu8A4L9bTa0U_D66iS9f7V6ncZQUrZlsxNUU4TJ7_V6Kx-F6QAiPm14tHemMWQveFyf_UzSULfqAU4kAsgNL651QT7jyle8Guw9oZkYZliowuZyRFcXNZIDsFB9vJdL3Q86MjFUQPsAF_VzKStWjoX4BtG54pXuzMBLyvSZWF_F9c7rdNvJBK3XyfC0cc2Zfpu3VZPKp4IZAwx0nfkm26HII"
              alt="User avatar"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Karim Ben Njima</h2>
            <p className="text-sm text-on-surface-variant/60 mt-0.5">karim.bennjima@email.com</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-primary-container/15 text-primary-container text-[0.6875rem] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm">
                Premium
              </span>
              <span className="text-[0.6875rem] text-on-surface-variant/40">Member since 2024</span>
            </div>
          </div>
        </section>

        {/* ── Vehicle snapshot ── */}
        <section className="bg-surface-container rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/50">
              Active Vehicle
            </h3>
            <button className="text-xs font-bold text-primary-container uppercase tracking-widest">
              Manage
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-14 bg-surface-container-low rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3NS6FsxKAd8cXKTqMcRzlzrfY8ftwKVi6qTxqfgi3us6X2mD8lPayD-EYtUJ_tNgp2Li43Awq46g456nF5357az3RNUSA5QENNbJJfe12JRqpwjgZFTQddHDPpuW_dyQXD2NIo503lt8wHyw6Y4zTEyMm_8LrYgyN0afnOYB3eHbuzDV1wa25ByXF78rauDvF5vBtM61wx93BmoU-zVmijwxyLZtN-8pFIfx2i0j1VbzSGXQpbIjpK4L_zzA0HrwF1cyx_hbj-fY"
                alt="Tesla Model 3"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-bold">Model 3 Long Range</h4>
              <p className="text-xs text-on-surface-variant/60 mt-0.5">VIN: ...A4F2 · NACS</p>
            </div>
          </div>
        </section>

        {/* ── Stats summary ── */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { label: 'Sessions', value: '12' },
            { label: 'Energy', value: '187 kWh' },
            { label: 'Saved', value: '$58.20' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-surface-container-low p-4 rounded-lg text-center"
            >
              <div className="text-lg font-bold">{s.value}</div>
              <span className="text-[0.6875rem] uppercase tracking-widest font-bold text-on-surface-variant/50">
                {s.label}
              </span>
            </div>
          ))}
        </section>

        {/* ── Menu items ── */}
        <section className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-surface-container transition-colors text-left"
            >
              <span className="material-symbols-outlined text-primary-container/80 text-2xl">
                {item.icon}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-sm">{item.label}</div>
                <div className="text-xs text-on-surface-variant/50 mt-0.5">{item.desc}</div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/30 text-xl">
                chevron_right
              </span>
            </button>
          ))}
        </section>

        {/* ── Sign out ── */}
        <button className="w-full py-3 text-error text-sm font-bold uppercase tracking-widest hover:bg-error/5 rounded-lg transition-colors">
          Sign Out
        </button>
      </main>
    </>
  )
}
