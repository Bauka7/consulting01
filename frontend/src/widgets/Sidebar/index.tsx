import { NavLink, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  FileText,
  Users,
  Bell,
  User,
  Link2,
  Trophy,
  ClipboardList,
  ShieldCheck,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import toast from 'react-hot-toast'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const clientNav: NavItem[] = [
  { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'My Requests', path: '/requests', icon: <FileText size={18} /> },
  { label: 'Consultants', path: '/consultants', icon: <Users size={18} /> },
  { label: 'Notifications', path: '/notifications', icon: <Bell size={18} /> },
  { label: 'Profile', path: '/profile', icon: <User size={18} /> },
]

const consultantNav: NavItem[] = [
  { label: 'Overview', path: '/consultant/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Assigned', path: '/consultant/requests', icon: <ClipboardList size={18} /> },
  { label: 'Notifications', path: '/consultant/notifications', icon: <Bell size={18} /> },
  { label: 'My Profile', path: '/consultant/profile', icon: <User size={18} /> },
  { label: 'Contact Links', path: '/consultant/links', icon: <Link2 size={18} /> },
  { label: 'Achievements', path: '/consultant/achievements', icon: <Trophy size={18} /> },
]

const adminNav: NavItem[] = [
  { label: 'Platform', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Users', path: '/admin/users', icon: <Users size={18} /> },
  { label: 'Consultants', path: '/admin/consultants', icon: <ShieldCheck size={18} /> },
  { label: 'Requests', path: '/admin/requests', icon: <FileText size={18} /> },
  { label: 'Notifications', path: '/admin/notifications', icon: <Bell size={18} /> },
  { label: 'Achievements', path: '/admin/achievements', icon: <Trophy size={18} /> },
  { label: 'Audit Log', path: '/admin/audit', icon: <ClipboardList size={18} /> },
]

function Logo() {
  return (
    <div className="flex items-center gap-2 px-3 py-1">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="6" width="6" height="20" rx="1" fill="white" />
        <rect x="22" y="6" width="6" height="20" rx="1" fill="white" />
        <path d="M10 6 L22 26" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
        <rect x="10" y="4" width="12" height="4" rx="1" fill="#F59E0B" />
      </svg>
      <div>
        <div className="text-white font-bold text-sm leading-none">NextGen.</div>
        <div className="text-white/50 text-[10px] font-medium tracking-widest leading-none mt-0.5">CONSULTING</div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const { user, logout, isConsultant, isAdmin } = useAuth()
  const navigate = useNavigate()

  const navItems = isAdmin ? adminNav : isConsultant ? consultantNav : clientNav

  const roleLabel = isAdmin ? 'Admin · NextGen' : isConsultant ? 'Consultant' : 'Client'

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  function handleLogout() {
    logout()
    toast.success('Signed out')
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col" style={{ background: '#0F172A' }}>
      <div className="px-4 py-5 border-b border-white/10">
        <Logo />
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'sidebar-link',
                    isActive && 'active',
                  )
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.fullName ?? '—'}</p>
            <p className="text-white/40 text-[10px] truncate">{roleLabel}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/40 hover:text-white/80 transition-colors"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
