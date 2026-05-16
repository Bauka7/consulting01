import { useQuery } from '@tanstack/react-query'
import { requestApi } from '@/entities/request/api'
import { consultantApi } from '@/entities/consultant/api'
import { Layout } from '@/widgets/Layout'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { EmptyState } from '@/shared/ui/EmptyState'
import { useAuth } from '@/shared/hooks/useAuth'
import { usePageSearch } from '@/shared/hooks/usePageSearch'
import { matchesSearch } from '@/shared/lib/search'
import { Link } from 'react-router-dom'
import { FileText, Clock, Zap, CheckCircle, Plus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { parseDate } from '@/shared/lib/date'
import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import type { RequestStatus } from '@/entities/request/types'

type TabKey = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'REJECTED'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'REJECTED', label: 'Rejected' },
]

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-teal-500',
  'bg-rose-500', 'bg-amber-500', 'bg-green-600', 'bg-gray-700',
]

function StatCard({
  label, value, icon, sub, accent, dark,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  sub?: string
  accent?: string
  dark?: boolean
}) {
  return (
    <div className={clsx('rounded-xl border p-5', dark ? 'bg-gray-900 border-gray-800' : 'bg-card border-border')}>
      <div className="flex items-start justify-between mb-3">
        <p className={clsx('text-xs font-semibold uppercase tracking-wide', dark ? 'text-white/50' : 'text-muted')}>{label}</p>
        <div className={dark ? 'text-white/30' : 'text-muted'}>{icon}</div>
      </div>
      <p className={clsx('text-3xl font-black', dark ? 'text-white' : 'text-text-main')}>{value}</p>
      {sub && <p className={clsx('text-xs mt-1', accent ?? (dark ? 'text-white/40' : 'text-muted'))}>{sub}</p>}
    </div>
  )
}

export default function ClientDashboard() {
  const { user } = useAuth()
  const { normalizedQuery } = usePageSearch()
  const [activeTab, setActiveTab] = useState<TabKey>('ALL')

  const { data: allRequests } = useQuery({
    queryKey: ['my-requests-all'],
    queryFn: () => requestApi.getMy({ page: 0, size: 100 }),
  })

  const { data: consultantsPage } = useQuery({
    queryKey: ['consultants-all-small'],
    queryFn: () => consultantApi.getAll({ page: 0, size: 100 }),
  })

  const requests = allRequests?.content ?? []

  const consultantNameMap = useMemo(() => {
    const map = new Map<string, string>()
    consultantsPage?.content.forEach((c) => map.set(c.id, c.fullName))
    return map
  }, [consultantsPage])

  function getConsultantName(consultantId: string | null): string | null {
    if (!consultantId) return null
    return consultantNameMap.get(consultantId) ?? null
  }

  const filteredRequests = requests.filter((r) =>
    matchesSearch(normalizedQuery, r.id, r.product, r.description, r.status, r.fullName, r.phone, r.comment),
  )

  const counts: Record<RequestStatus, number> = { PENDING: 0, PROGRESS: 0, COMPLETED: 0, REJECTED: 0 }
  filteredRequests.forEach((r) => counts[r.status]++)

  const tabCounts: Record<TabKey, number> = {
    ALL: filteredRequests.length,
    ACTIVE: counts.PENDING + counts.PROGRESS,
    COMPLETED: counts.COMPLETED,
    REJECTED: counts.REJECTED,
  }

  const tabFiltered = filteredRequests.filter((r) => {
    if (activeTab === 'ACTIVE') return r.status === 'PENDING' || r.status === 'PROGRESS'
    if (activeTab === 'COMPLETED') return r.status === 'COMPLETED'
    if (activeTab === 'REJECTED') return r.status === 'REJECTED'
    return true
  })

  return (
    <Layout
      title="My Requests"
      breadcrumb="WORKSPACE / REQUESTS"
      actions={
        <Link to="/requests/new" className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus size={15} /> New Request
        </Link>
      }
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-main">Welcome back, {user?.fullName?.split(' ')[0]}.</h2>
        {counts.PROGRESS > 0 && (
          <p className="text-sm text-muted mt-0.5">
            You have <span className="text-accent font-semibold">{counts.PROGRESS} active</span> engagement{counts.PROGRESS !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="My Requests"
          value={filteredRequests.length}
          icon={<FileText size={18} />}
          sub={filteredRequests.length === 0 ? 'No requests yet' : `+${counts.PENDING + counts.PROGRESS} open`}
        />
        <StatCard
          label="Pending"
          value={counts.PENDING}
          icon={<Clock size={18} />}
          sub={counts.PENDING === 0 ? 'Nothing waiting' : 'Awaiting consultant'}
        />
        <StatCard
          label="In Progress"
          value={counts.PROGRESS}
          icon={<Zap size={18} />}
          sub={counts.PROGRESS === 0 ? 'None active' : `${counts.PROGRESS} being handled`}
          accent="text-accent"
        />
        <StatCard
          label="Completed"
          value={counts.COMPLETED}
          icon={<CheckCircle size={18} />}
          sub={counts.COMPLETED === 0 ? 'None yet' : counts.REJECTED > 0 ? `${counts.REJECTED} rejected` : 'All resolved'}
          accent="text-success"
          dark
        />
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-wrap gap-3">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-semibold text-text-main mr-2">Recent requests</span>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.key ? 'bg-gray-900 text-white' : 'text-muted hover:text-text-main',
                )}
              >
                {tab.label} · {tabCounts[tab.key]}
              </button>
            ))}
          </div>
        </div>

        {tabFiltered.length === 0 ? (
          <EmptyState
            title={activeTab !== 'ALL' ? `No ${activeTab.toLowerCase()} requests` : 'No requests yet'}
            description="Submit your first consultation request."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted px-6 py-3 uppercase tracking-wide">ID</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3 uppercase tracking-wide">Request</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3 uppercase tracking-wide">Category</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3 uppercase tracking-wide">Consultant</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3 uppercase tracking-wide">Status</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3 uppercase tracking-wide">Updated</th>
                </tr>
              </thead>
              <tbody>
                {tabFiltered.slice(0, 10).map((request) => {
                  const consultantName = getConsultantName(request.consultantId)
                  const initials = consultantName
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                  const colorIdx = request.consultantId
                    ? request.consultantId.charCodeAt(0) % AVATAR_COLORS.length
                    : 0
                  const categoryWord = request.product.split(' ')[0]

                  return (
                    <tr key={request.id} className="border-b border-border last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 text-xs text-muted font-mono">
                        #{request.id.slice(0, 4).toUpperCase()}
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <Link
                          to={`/requests/${request.id}`}
                          className="text-sm font-medium text-text-main hover:text-accent"
                        >
                          {request.product}
                        </Link>
                        <p className="text-xs text-muted truncate mt-0.5">{request.description.slice(0, 55)}{request.description.length > 55 ? '…' : ''}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {categoryWord}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {consultantName ? (
                          <div className="flex items-center gap-2">
                            <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold', AVATAR_COLORS[colorIdx])}>
                              {initials}
                            </div>
                            <span className="text-sm text-text-main">{consultantName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted whitespace-nowrap">
                        {formatDistanceToNow(parseDate(request.updatedAt), { addSuffix: true })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {tabFiltered.length > 10 && (
          <div className="px-6 py-3 border-t border-border">
            <Link to="/requests" className="text-xs text-muted hover:text-text-main">
              Showing 10 of {tabFiltered.length} — View all →
            </Link>
          </div>
        )}
      </div>
    </Layout>
  )
}
