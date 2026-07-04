import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  RiDashboardLine, RiTruckLine, RiMapPinLine, RiPriceTagLine,
  RiUserLine, RiLogoutBoxLine, RiSettings3Line, RiMapLine,
  RiBarChartLine, RiListCheck2, RiMotorbikeLine,
} from 'react-icons/ri'

const ADMIN_NAV = [
  { to: '/admin',           label: 'Dashboard',    icon: RiDashboardLine,  end: true },
  { to: '/admin/orders',    label: 'All Orders',   icon: RiListCheck2 },
  { to: '/admin/zones',     label: 'Zones',        icon: RiMapLine },
  { to: '/admin/rate-cards',label: 'Rate Cards',   icon: RiPriceTagLine },
  { to: '/admin/agents',    label: 'Agents',       icon: RiMotorbikeLine },
  { to: '/admin/customers', label: 'Customers',    icon: RiUserLine },
]

const AGENT_NAV = [
  { to: '/agent',         label: 'My Orders',   icon: RiListCheck2, end: true },
  { to: '/agent/profile', label: 'Profile',     icon: RiUserLine },
]

const CUSTOMER_NAV = [
  { to: '/dashboard',       label: 'Dashboard',   icon: RiDashboardLine, end: true },
  { to: '/dashboard/place', label: 'Place Order', icon: RiTruckLine },
  { to: '/dashboard/orders',label: 'My Orders',   icon: RiListCheck2 },
]

const NAV_MAP = { admin: ADMIN_NAV, agent: AGENT_NAV, customer: CUSTOMER_NAV }

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const nav = NAV_MAP[user?.role] || CUSTOMER_NAV

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleColor = {
    admin:    'text-red-400',
    agent:    'text-cyan-400',
    customer: 'text-gold-500',
  }[user?.role] || 'text-gold-500'

  return (
    <aside className="flex flex-col h-full w-56 bg-navy-900 border-r border-white/5 select-none">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center">
            <RiTruckLine className="text-navy-950 text-lg" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">LastMile</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Delivery</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${
                isActive ? 'nav-active' : 'text-slate-400'
              }`
            }
          >
            <Icon className="text-base flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gold-500">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
            <p className={`text-[10px] uppercase font-bold tracking-wider ${roleColor}`}>{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400"
        >
          <RiLogoutBoxLine />
          Logout
        </button>
      </div>
    </aside>
  )
}