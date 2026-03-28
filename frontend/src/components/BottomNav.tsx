import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/map', icon: 'map', label: 'Map' },
  { to: '/reservations', icon: 'event_seat', label: 'Reservations' },
  { to: '/profile', icon: 'person', label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center pt-3 pb-8 px-4 bg-[#131313]/90 backdrop-blur-xl z-50 shadow-[0_-4px_40px_rgba(232,33,39,0.08)]">
      {navItems.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-4 py-1 transition-colors duration-200 active:scale-90 ${
              isActive
                ? 'text-[#e2e2e2] bg-[#e82127] rounded-sm'
                : 'text-[#353535] hover:text-[#ffb4ac]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {icon}
              </span>
              <span className="font-headline text-[0.6875rem] uppercase tracking-[0.05em] font-medium mt-1">
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
