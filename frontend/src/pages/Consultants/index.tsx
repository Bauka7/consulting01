import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { consultantApi } from '@/entities/consultant/api'
import { useAuth } from '@/shared/hooks/useAuth'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { Search, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ConsultantDto } from '@/entities/consultant/types'

const colors = ['bg-blue-500', 'bg-gray-800', 'bg-amber-500', 'bg-gray-700', 'bg-purple-500', 'bg-teal-500', 'bg-rose-500', 'bg-green-600']

function ConsultantCard({ consultant }: { consultant: ConsultantDto }) {
  const colorIndex = consultant.id.charCodeAt(0) % colors.length

  const initials = consultant.fullName
    ? consultant.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <Link
      to={`/consultants/${consultant.id}`}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow block"
    >
      <div className={`w-10 h-10 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white text-sm font-bold mb-3`}>
        {initials}
      </div>
      <h3 className="font-semibold text-gray-900 text-sm">{consultant.fullName ?? 'Consultant'}</h3>
      <p className="text-gray-500 text-xs mt-0.5">{consultant.specialization}</p>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Experience</p>
          <p className="text-sm font-semibold text-gray-900">{consultant.experience}</p>
        </div>
        <ChevronRight size={16} className="text-gray-400" />
      </div>
    </Link>
  )
}

export default function Consultants() {
  const [search, setSearch] = useState('')
  const { isAuthenticated, user } = useAuth()
  const debouncedSearch = useDebounce(search, 300)

  const workspacePath =
    user?.role === 'ADMIN'
      ? '/admin/dashboard'
      : user?.role === 'CONSULTANT'
        ? '/consultant/dashboard'
        : '/dashboard'

  const consultationPath =
    user?.role === 'CLIENT'
      ? '/requests/new'
      : user?.role === 'CONSULTANT'
        ? '/consultant/dashboard'
        : user?.role === 'ADMIN'
          ? '/admin/consultants'
          : '/register'

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['consultants-search', debouncedSearch],
    queryFn: () => consultantApi.search(debouncedSearch || undefined),
    enabled: !!debouncedSearch,
  })

  const { data: allPage, isLoading: allLoading } = useQuery({
    queryKey: ['consultants-all'],
    queryFn: () => consultantApi.getAll({ page: 0, size: 20 }),
    enabled: !debouncedSearch,
  })

  const consultants = debouncedSearch ? (searchResults ?? []) : (allPage?.content ?? [])
  const isLoading = debouncedSearch ? searchLoading : allLoading

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="6" width="6" height="20" rx="1" fill="#0F172A" />
            <rect x="22" y="6" width="6" height="20" rx="1" fill="#0F172A" />
            <path d="M10 6 L22 26" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
            <rect x="10" y="4" width="12" height="4" rx="1" fill="#F59E0B" />
          </svg>
          <span className="font-bold text-gray-900">NextGen.</span>
        </Link>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to={workspacePath} className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                Workspace
              </Link>
              <Link to={consultationPath} className="btn-primary text-sm">
                {user?.role === 'CLIENT' ? 'New Request' : 'Open Workspace'}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm">Get Consultation</Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Find a consultant</h1>
        <p className="text-muted text-sm mb-8">Browse our network of senior operators</p>

        <div className="relative mb-8 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or specialization..."
            className="input-field pl-9"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5 animate-pulse h-40" />
            ))}
          </div>
        ) : consultants.length === 0 ? (
          <p className="text-muted text-sm">No consultants found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {consultants.map((c) => (
              <ConsultantCard key={c.id} consultant={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
