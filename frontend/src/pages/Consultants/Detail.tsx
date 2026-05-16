import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { consultantApi } from '@/entities/consultant/api'
import { contactLinkApi } from '@/entities/contactLink/api'
import { achievementApi } from '@/entities/achievement/api'
import { useAuth } from '@/shared/hooks/useAuth'
import { ArrowLeft, Trophy, Link2 } from 'lucide-react'
import { format } from 'date-fns'
import { parseDate } from '@/shared/lib/date'

const colors = ['bg-blue-500', 'bg-gray-800', 'bg-amber-500', 'bg-gray-700', 'bg-purple-500', 'bg-teal-500']

export default function ConsultantDetail() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, user: authUser } = useAuth()

  const consultationPath =
    authUser?.role === 'CLIENT'
      ? '/requests/new'
      : authUser?.role === 'CONSULTANT'
        ? '/consultant/dashboard'
        : authUser?.role === 'ADMIN'
          ? '/admin/consultants'
          : '/register'

  const { data: consultant, isLoading } = useQuery({
    queryKey: ['consultant', id],
    queryFn: () => consultantApi.getById(id!),
    enabled: !!id,
  })

  const { data: links } = useQuery({
    queryKey: ['contact-links', consultant?.userId],
    queryFn: () => contactLinkApi.getByUser(consultant!.userId),
    enabled: !!consultant?.userId,
  })

  const { data: achievements } = useQuery({
    queryKey: ['achievements', consultant?.userId],
    queryFn: () => achievementApi.getByUser(consultant!.userId),
    enabled: !!consultant?.userId,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!consultant) return null

  const colorIndex = consultant.id.charCodeAt(0) % colors.length
  const initials = consultant.fullName
    ? consultant.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-100 px-8 py-4">
        <Link to="/consultants" className="flex items-center gap-2 text-sm text-muted hover:text-gray-900">
          <ArrowLeft size={16} />
          Back to consultants
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-start gap-5 mb-8">
            <div className={`w-16 h-16 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white text-2xl font-bold`}>
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">{consultant.fullName ?? 'Consultant'}</h1>
              <p className="text-muted mt-1">{consultant.specialization}</p>
              <p className="text-sm text-gray-500 mt-0.5">Experience: <span className="font-semibold text-gray-900">{consultant.experience}</span></p>
            </div>
          </div>

          {links && links.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Link2 size={14} /> Contact
              </h2>
              <div className="flex flex-wrap gap-2">
                {links.map((l) => (
                  <a
                    key={l.id}
                    href={l.link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    {l.serviceName}
                  </a>
                ))}
              </div>
            </div>
          )}

          {achievements && achievements.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Trophy size={14} /> Achievements
              </h2>
              <div className="space-y-2">
                {achievements.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2">
                    <Trophy size={14} className="text-gold" />
                    <p className="text-sm text-gray-700">{a.description}</p>
                    <span className="ml-auto text-xs text-muted">{format(parseDate(a.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link to={consultationPath} className="btn-primary w-full text-center block py-3">
              {isAuthenticated && authUser?.role === 'CLIENT' ? 'Create request' : isAuthenticated ? 'Open workspace' : 'Request a consultation'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
