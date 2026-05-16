import { Bell, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { notificationApi } from '@/entities/notification/api'
import { useAuth } from '@/shared/hooks/useAuth'
import { Link, matchPath, useLocation, useSearchParams } from 'react-router-dom'

interface Props {
  title: string
  actions?: React.ReactNode
  breadcrumb?: string
}

const SEARCH_CONFIGS = [
  { pattern: '/dashboard', placeholder: 'Search requests...' },
  { pattern: '/requests', placeholder: 'Search requests...' },
  { pattern: '/notifications', placeholder: 'Search notifications...' },
  { pattern: '/consultant/dashboard', placeholder: 'Search requests...' },
  { pattern: '/consultant/notifications', placeholder: 'Search notifications...' },
  { pattern: '/consultant/requests', placeholder: 'Search requests...' },
  { pattern: '/admin/dashboard', placeholder: 'Search requests...' },
  { pattern: '/admin/notifications', placeholder: 'Search notifications...' },
  { pattern: '/admin/users', placeholder: 'Search users...' },
  { pattern: '/admin/consultants', placeholder: 'Search consultants...' },
  { pattern: '/admin/requests', placeholder: 'Search requests...' },
  { pattern: '/admin/achievements', placeholder: 'Search achievements...' },
]

export function Header({ title, actions, breadcrumb }: Props) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const { data: notifications } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => notificationApi.getMy({ size: 50 }),
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  })

  const unread = notifications?.content.filter((n) => !n.isRead).length ?? 0
  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const notifPath = user?.role === 'CLIENT' ? '/notifications' : user?.role === 'CONSULTANT' ? '/consultant/notifications' : '/admin/notifications'
  const searchConfig = SEARCH_CONFIGS.find((config) =>
    !!matchPath({ path: config.pattern, end: true }, location.pathname),
  )
  const searchValue = searchParams.get('q') ?? ''

  function handleSearchChange(value: string) {
    const nextParams = new URLSearchParams(searchParams)
    if (value.trim()) {
      nextParams.set('q', value)
    } else {
      nextParams.delete('q')
    }
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <header className="min-h-14 bg-white border-b border-border flex items-center px-6 gap-4 sticky top-0 z-10 py-2">
      <div className="flex-1">
        {breadcrumb && (
          <p className="text-[10px] text-muted uppercase tracking-widest font-semibold mb-0.5">{breadcrumb}</p>
        )}
        <h1 className="text-lg font-semibold text-text-main leading-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {searchConfig && (
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 text-sm text-muted w-64">
            <Search size={14} className="flex-shrink-0" />
            <input
              value={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={searchConfig.placeholder}
              className="w-full bg-transparent outline-none text-text-main placeholder:text-muted"
            />
          </div>
        )}

        <Link to={notifPath} className="relative p-2 text-muted hover:text-text-main transition-colors">
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-accent rounded-full text-white text-[10px] flex items-center justify-center font-bold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>

        {actions}

        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
      </div>
    </header>
  )
}
