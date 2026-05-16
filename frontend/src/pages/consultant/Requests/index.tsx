import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestApi } from '@/entities/request/api'
import { Layout } from '@/widgets/Layout'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { EmptyState } from '@/shared/ui/EmptyState'
import { usePageSearch } from '@/shared/hooks/usePageSearch'
import { matchesSearch } from '@/shared/lib/search'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { parseDate } from '@/shared/lib/date'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { clsx } from 'clsx'
import { Loader } from 'lucide-react'
import type { RequestStatus } from '@/entities/request/types'

const TABS: { label: string; status?: RequestStatus }[] = [
  { label: 'Active', status: 'PROGRESS' },
  { label: 'Pending', status: 'PENDING' },
  { label: 'Closed' },
]

export default function ConsultantRequests() {
  const [activeTab, setActiveTab] = useState(0)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const { normalizedQuery, hasSearchQuery } = usePageSearch()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['consultant-requests'],
    queryFn: () => requestApi.getConsultant({ page: 0, size: 50 }),
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

  const allRequests = data?.content ?? []

  const filtered = TABS[activeTab].status
    ? allRequests.filter((r) => r.status === TABS[activeTab].status)
    : allRequests.filter((r) => r.status === 'COMPLETED' || r.status === 'REJECTED')
  const searched = filtered.filter((request) =>
    matchesSearch(
      normalizedQuery,
      request.id,
      request.product,
      request.description,
      request.status,
      request.fullName,
      request.phone,
      request.comment,
    ),
  )

  return (
    <Layout title="Assigned">
      <div className="flex gap-1 mb-6 bg-white border border-border rounded-xl p-1 w-fit">
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === i ? 'bg-primary text-white' : 'text-muted hover:text-text-main',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border">
        {isLoading ? (
          <div className="p-8 text-center text-muted text-sm">Loading...</div>
        ) : searched.length === 0 ? (
          <EmptyState
            title={
              hasSearchQuery
                ? 'No matching requests'
                : activeTab === 0
                  ? 'No active requests'
                  : activeTab === 1
                    ? 'No pending requests'
                    : 'No closed requests'
            }
            description={
              hasSearchQuery
                ? 'Try a different search term or tab.'
                : activeTab === 1
                  ? 'New requests from clients will appear here.'
                  : 'Requests will move here once processed.'
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {searched.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <StatusBadge status={r.status} />
                    {r.status === 'PENDING' && (
                      <span className="text-xs text-muted">awaiting action</span>
                    )}
                  </div>
                  <Link
                    to={`/consultant/requests/${r.id}`}
                    className="text-sm font-semibold text-text-main hover:text-accent"
                  >
                    {r.product}
                  </Link>
                  <p className="text-xs text-muted">{r.fullName} · {format(parseDate(r.updatedAt), 'MMM d')}</p>
                </div>

                <div className="flex gap-2">
                  {r.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleAction(r.id, 'REJECTED')}
                        disabled={!!loadingId}
                        className="btn-ghost text-xs flex items-center gap-1"
                      >
                        {loadingId === `${r.id}-REJECTED` ? <Loader size={12} className="animate-spin" /> : null}
                        {loadingId === `${r.id}-REJECTED` ? 'Declining...' : 'Decline'}
                      </button>
                      <button
                        onClick={() => handleAction(r.id, 'PROGRESS')}
                        disabled={!!loadingId}
                        className="btn-primary text-xs flex items-center gap-1"
                      >
                        {loadingId === `${r.id}-PROGRESS` ? <Loader size={12} className="animate-spin" /> : null}
                        {loadingId === `${r.id}-PROGRESS` ? 'Accepting...' : 'Accept'}
                      </button>
                    </>
                  )}
                  {r.status === 'PROGRESS' && (
                    <>
                      <button
                        onClick={() => handleAction(r.id, 'COMPLETED')}
                        disabled={!!loadingId}
                        className="btn-primary text-xs flex items-center gap-1"
                      >
                        {loadingId === `${r.id}-COMPLETED` ? <Loader size={12} className="animate-spin" /> : null}
                        {loadingId === `${r.id}-COMPLETED` ? 'Completing...' : 'Complete'}
                      </button>
                      <Link to={`/consultant/requests/${r.id}`} className="btn-ghost text-xs">
                        Open
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
