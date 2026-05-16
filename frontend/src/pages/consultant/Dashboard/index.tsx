import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestApi } from '@/entities/request/api'
import { consultantApi } from '@/entities/consultant/api'
import { Layout } from '@/widgets/Layout'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { useAuth } from '@/shared/hooks/useAuth'
import { usePageSearch } from '@/shared/hooks/usePageSearch'
import { matchesSearch } from '@/shared/lib/search'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { parseDate } from '@/shared/lib/date'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useState } from 'react'
import { clsx } from 'clsx'
import { Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import type { RequestStatus } from '@/entities/request/types'

const STATUS_COLORS: Record<RequestStatus, string> = {
  PENDING: '#F59E0B',
  PROGRESS: '#3B82F6',
  COMPLETED: '#10B981',
  REJECTED: '#6B7280',
}

type TabKey = 'ACTIVE' | 'PENDING' | 'CLOSED'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ACTIVE', label: 'Active' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CLOSED', label: 'Closed' },
]

export default function ConsultantDashboard() {
  const { user } = useAuth()
  const { normalizedQuery } = usePageSearch()
  const [activeTab, setActiveTab] = useState<TabKey>('ACTIVE')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data: assignedPage } = useQuery({
    queryKey: ['consultant-requests'],
    queryFn: () => requestApi.getConsultant({ page: 0, size: 100 }),
  })

  const { data: consultant } = useQuery({
    queryKey: ['my-consultant', user?.id],
    queryFn: () => consultantApi.getByUserId(user!.id),
    enabled: !!user?.id,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      requestApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consultant-requests'] })
      toast.success('Status updated')
      setLoadingId(null)
    },
    onError: () => {
      toast.error('Failed to update status')
      setLoadingId(null)
    },
  })

  function handleAction(id: string, status: RequestStatus) {
    setLoadingId(`${id}-${status}`)
    updateStatus.mutate({ id, status })
  }

  const requests = assignedPage?.content ?? []
  const filteredRequests = requests.filter((r) =>
    matchesSearch(normalizedQuery, r.id, r.product, r.description, r.status, r.fullName, r.phone, r.comment),
  )

  const counts: Record<RequestStatus, number> = { PENDING: 0, PROGRESS: 0, COMPLETED: 0, REJECTED: 0 }
  filteredRequests.forEach((r) => counts[r.status]++)

  const tabFiltered = filteredRequests.filter((r) => {
    if (activeTab === 'ACTIVE') return r.status === 'PROGRESS'
    if (activeTab === 'PENDING') return r.status === 'PENDING'
    return r.status === 'COMPLETED' || r.status === 'REJECTED'
  })

  const tabCounts: Record<TabKey, number> = {
    ACTIVE: counts.PROGRESS,
    PENDING: counts.PENDING,
    CLOSED: counts.COMPLETED + counts.REJECTED,
  }

  const utilization =
    filteredRequests.length > 0
      ? Math.round((counts.PROGRESS / filteredRequests.length) * 100)
      : 0

  const pieData = Object.entries(counts)
    .filter(([, value]) => value > 0)
    .map(([status, value]) => ({
      name: status === 'PROGRESS' ? 'In Progress' : status.charAt(0) + status.slice(1).toLowerCase(),
      value,
      status: status as RequestStatus,
    }))

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <Layout
      title="Consultant Workspace"
      breadcrumb="PRACTICE / ASSIGNED"
      actions={
        <Link to="/consultant/requests" className="btn-primary text-sm flex items-center gap-1.5">
          View All Requests
        </Link>
      }
    >
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Completed</p>
          <p className="text-3xl font-black text-text-main">{counts.COMPLETED}</p>
          <p className="text-xs text-muted mt-1">
            {counts.COMPLETED === 0 ? 'No completed yet' : `${counts.PENDING} pending · ${counts.PROGRESS} active`}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Utilization</p>
          <p className="text-3xl font-black text-text-main">{utilization}%</p>
          <div className="h-1.5 bg-gray-100 rounded-full mt-2">
            <div className="h-1.5 bg-accent rounded-full transition-all" style={{ width: `${utilization}%` }} />
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 text-white">
          <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Total Assigned</p>
          <p className="text-3xl font-black">{filteredRequests.length}</p>
          <p className="text-xs text-white/40 mt-1">{counts.COMPLETED} done · {counts.REJECTED} rejected</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Assigned engagements */}
        <div className="col-span-2 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-text-main">Assigned engagements</h3>
            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
              {counts.PROGRESS} active
            </span>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border px-6">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
                  activeTab === tab.key
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted hover:text-text-main',
                )}
              >
                {tab.label}
                {tabCounts[tab.key] > 0 && (
                  <span className={clsx('ml-1.5 text-xs px-1.5 py-0.5 rounded-full', activeTab === tab.key ? 'bg-accent/10' : 'bg-gray-100')}>
                    {tabCounts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tabFiltered.length === 0 ? (
            <p className="px-6 py-10 text-muted text-sm text-center">
              {activeTab === 'ACTIVE' ? 'No active requests' : activeTab === 'PENDING' ? 'No pending requests' : 'No closed requests'}
            </p>
          ) : (
            <div className="divide-y divide-border">
              {tabFiltered.map((r) => (
                <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={r.status} />
                      {r.status === 'PENDING' && (
                        <span className="text-xs text-amber-600 font-medium">· awaiting action</span>
                      )}
                    </div>
                    <Link
                      to={`/consultant/requests/${r.id}`}
                      className="text-sm font-semibold text-text-main hover:text-accent"
                    >
                      {r.product}
                    </Link>
                    <p className="text-xs text-muted mt-0.5">
                      {r.fullName} · {formatDistanceToNow(parseDate(r.updatedAt), { addSuffix: true })}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {r.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAction(r.id, 'REJECTED')}
                          disabled={!!loadingId}
                          className="btn-ghost text-xs flex items-center gap-1 py-1.5"
                        >
                          {loadingId === `${r.id}-REJECTED` ? <Loader size={11} className="animate-spin" /> : null}
                          Decline
                        </button>
                        <button
                          onClick={() => handleAction(r.id, 'PROGRESS')}
                          disabled={!!loadingId}
                          className="btn-primary text-xs flex items-center gap-1 py-1.5"
                        >
                          {loadingId === `${r.id}-PROGRESS` ? <Loader size={11} className="animate-spin" /> : null}
                          Accept
                        </button>
                      </>
                    )}
                    {r.status === 'PROGRESS' && (
                      <>
                        <button
                          onClick={() => handleAction(r.id, 'COMPLETED')}
                          disabled={!!loadingId}
                          className="btn-primary text-xs py-1.5"
                        >
                          {loadingId === `${r.id}-COMPLETED` ? <Loader size={11} className="animate-spin mr-1" /> : null}
                          Complete
                        </button>
                        <Link to={`/consultant/requests/${r.id}`} className="btn-ghost text-xs py-1.5">
                          Open
                        </Link>
                      </>
                    )}
                    {(r.status === 'COMPLETED' || r.status === 'REJECTED') && (
                      <Link to={`/consultant/requests/${r.id}`} className="btn-ghost text-xs py-1.5">
                        View
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Profile + Pie chart */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">Verified</span>
            </div>
            <p className="font-bold text-text-main">{user?.fullName}</p>
            <p className="text-xs text-muted mb-3">Consultant</p>

            {consultant && (
              <div className="space-y-2 mb-4 pt-3 border-t border-border">
                <div>
                  <p className="text-[10px] text-muted uppercase tracking-wide font-semibold">Specialization</p>
                  <p className="text-sm text-text-main font-medium mt-0.5">{consultant.specialization}</p>
                </div>
                {consultant.experience && (
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wide font-semibold">Experience</p>
                    <p className="text-sm text-text-main font-medium mt-0.5">{consultant.experience}</p>
                  </div>
                )}
              </div>
            )}

            <Link to="/consultant/profile" className="btn-ghost w-full text-center block text-sm py-2">
              Edit profile
            </Link>
          </div>

          {pieData.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-main">Engagement mix</h3>
                <span className="text-xs text-muted">{filteredRequests.length} total</span>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} dataKey="value">
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.status]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[item.status] }} />
                      <span className="text-muted">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{item.value}</span>
                      <span className="text-muted">{Math.round((item.value / filteredRequests.length) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
