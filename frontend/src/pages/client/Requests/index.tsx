import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestApi } from '@/entities/request/api'
import { Layout } from '@/widgets/Layout'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { usePageSearch } from '@/shared/hooks/usePageSearch'
import { matchesSearch } from '@/shared/lib/search'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { parseDate } from '@/shared/lib/date'
import toast from 'react-hot-toast'
import type { RequestStatus } from '@/entities/request/types'
import { clsx } from 'clsx'

const TABS: { label: string; status?: RequestStatus }[] = [
  { label: 'All' },
  { label: 'Pending', status: 'PENDING' },
  { label: 'In Progress', status: 'PROGRESS' },
  { label: 'Completed', status: 'COMPLETED' },
  { label: 'Rejected', status: 'REJECTED' },
]

export default function ClientRequests() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { normalizedQuery, hasSearchQuery } = usePageSearch()
  const qc = useQueryClient()

  const status = TABS[activeTab].status

  const { data, isLoading } = useQuery({
    queryKey: ['my-requests', status],
    queryFn: () => requestApi.getMy({ status, page: 0, size: 50 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => requestApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-requests'] })
      toast.success('Request deleted')
      setDeleteId(null)
    },
    onError: () => toast.error('Failed to delete'),
  })

  const requests = data?.content ?? []
  const filteredRequests = requests.filter((request) =>
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
    <Layout
      title="My Requests"
      actions={
        <Link to="/requests/new" className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus size={15} /> New Request
        </Link>
      }
    >
      {/* Tabs */}
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
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            title={hasSearchQuery ? 'No matching requests' : 'No requests'}
            description={hasSearchQuery ? 'Try a different search term or tab.' : 'No requests match this filter.'}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted px-6 py-3">ID</th>
                <th className="text-left text-xs font-medium text-muted px-4 py-3">PRODUCT</th>
                <th className="text-left text-xs font-medium text-muted px-4 py-3">STATUS</th>
                <th className="text-left text-xs font-medium text-muted px-4 py-3">CREATED</th>
                <th className="text-left text-xs font-medium text-muted px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/requests/${r.id}`)}
                  className="border-b border-border last:border-0 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-3 text-xs text-muted font-mono">#{r.id.slice(0, 4).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-text-main">{r.product}</p>
                    <p className="text-xs text-muted truncate max-w-xs">{r.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {format(parseDate(r.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {(r.status === 'PENDING') && (
                      <button
                        onClick={() => setDeleteId(r.id)}
                        className="p-1.5 text-muted hover:text-danger transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete request?"
        description="This action cannot be undone."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </Layout>
  )
}
