import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, Bell, User,
  Link2, Trophy, ClipboardList, ShieldCheck, LogOut,
  Building2, Tag, MessageSquare,
} from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { LogoFull } from '@/shared/ui/Logo'
import toast from 'react-hot-toast'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  badge?: number
}

const clientNav: NavItem[] = [
  { label: 'Обзор', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Заводы', path: '/factories', icon: <Building2 size={18} /> },
  { label: 'Мои заявки', path: '/requests', icon: <FileText size={18} /> },
  { label: 'Сообщения', path: '/messages', icon: <MessageSquare size={18} />, badge: 2 },
  { label: 'Уведомления', path: '/notifications', icon: <Bell size={18} /> },
  { label: 'Профиль', path: '/profile', icon: <User size={18} /> },
]

const consultantNav: NavItem[] = [
  { label: 'Обзор', path: '/consultant/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Заявки', path: '/consultant/requests', icon: <ClipboardList size={18} />, badge: 3 },
  { label: 'Сообщения', path: '/consultant/messages', icon: <MessageSquare size={18} />, badge: 5 },
  { label: 'Уведомления', path: '/consultant/notifications', icon: <Bell size={18} /> },
  { label: 'Мой профиль', path: '/consultant/profile', icon: <User size={18} /> },
  { label: 'Контакты', path: '/consultant/links', icon: <Link2 size={18} /> },
  { label: 'Достижения', path: '/consultant/achievements', icon: <Trophy size={18} /> },
]

const adminNav: NavItem[] = [
  { label: 'Обзор', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Пользователи', path: '/admin/users', icon: <Users size={18} /> },
  { label: 'Консультанты', path: '/admin/consultants', icon: <ShieldCheck size={18} /> },
  { label: 'Заводы', path: '/admin/factories', icon: <Building2 size={18} /> },
  { label: 'Категории', path: '/admin/categories', icon: <Tag size={18} /> },
  { label: 'Заявки', path: '/admin/requests', icon: <FileText size={18} /> },
  { label: 'Достижения', path: '/admin/achievements', icon: <Trophy size={18} /> },
  { label: 'Аудит', path: '/admin/audit', icon: <ClipboardList size={18} /> },
]

export function Sidebar() {
  const { user, logout, isConsultant, isAdmin } = useAuth()
  const navigate = useNavigate()

  const navItems = isAdmin ? adminNav : isConsultant ? consultantNav : clientNav
  const roleLabel = isAdmin ? 'Администратор' : isConsultant ? 'Консультант' : 'Клиент'

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  function handleLogout() {
    logout()
    toast.success('Вы вышли')
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col" style={{ background: '#0C1426' }}>
      <div className="px-4 py-5 border-b border-white/10">
        <LogoFull variant="light" size="md" />
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="w-5 h-5 bg-[#E63946] rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-[#E63946] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.fullName ?? '—'}</p>
            <p className="text-white/40 text-[10px] truncate">{roleLabel}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/40 hover:text-white/80 transition-colors"
            title="Выйти"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
