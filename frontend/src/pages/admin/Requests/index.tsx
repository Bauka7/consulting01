import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestApi } from '@/entities/request/api'
import { consultantApi } from '@/entities/consultant/api'
import { Layout } from '@/widgets/Layout'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { EmptyState } from '@/shared/ui/EmptyState'
import { usePageSearch } from '@/shared/hooks/usePageSearch'
import { matchesSearch } from '@/shared/lib/search'
import { format } from 'date-fns'
import { parseDate } from '@/shared/lib/date'
import { clsx } from 'clsx'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { RequestDto, RequestStatus } from '@/entities/request/types'

const TABS: { label: string; status?: RequestStatus }[] = [
  { label: 'All' },
  { label: 'Pending', status: 'PENDING' },
  { label: 'In Progress', status: 'PROGRESS' },
  { label: 'Completed', status: 'COMPLETED' },
  { label: 'Rejected', status: 'REJECTED' },
]

const TERMINAL: RequestStatus[] = ['COMPLETED', 'REJECTED']

const NEXT_STATUSES: Record<RequestStatus, RequestStatus[]> = {
  PENDING: ['PROGRESS', 'REJECTED'],
  PROGRESS: ['COMPLETED', 'REJECTED'],
  COMPLETED: [],
  REJECTED: [],
}

export default function AdminRequests() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState(0)
  const [page, setPage] = useState(0)
  const { normalizedQuery, hasSearchQuery } = usePageSearch()
  const [selected, setSelected] = useState<RequestDto | null>(null)
  const [newStatus, setNewStatus] = useState<RequestStatus | ''>('')
  const [comment, setComment] = useState('')
  const [assignConsultantId, setAssignConsultantId] = useState('')

  const status = TABS[activeTab].status

  const { data, isLoading } = useQuery({
    queryKey: ['admin-all-requests', status, page],
    queryFn: () => requestApi.getAll({ status, page, size: 20 }),
  })

  const { data: consultantsPage } = useQuery({
    queryKey: ['consultants-list-admin'],
    queryFn: () => consultantApi.getAll({ page: 0, size: 100 }),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, s, c }: { id: string; s: RequestStatus; c?: string }) =>
      requestApi.updateStatus(id, s, c),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-all-requests'] })
      toast.success('Status updated')
      closeModal()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to update status'),
  })

  const assignConsultant = useMutation({
    mutationFn: ({ id, consultantId }: { id: string; consultantId: string | null }) =>
      consultantId
        ? requestApi.update(id, { consultantId })
        : requestApi.update(id, { removeConsultant: true }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-all-requests'] })
      toast.success(vars.consultantId ? 'Consultant assigned' : 'Consultant removed')
      closeModal()
    },
    onError: () => toast.error('Failed to update consultant'),
  })

  function openModal(req: RequestDto) {
    setSelected(req)
    setNewStatus('')
    setComment('')
    setAssignConsultantId(req.consultantId ?? '')
  }

  function closeModal() {
    setSelected(null)
    setNewStatus('')
    setComment('')
    setAssignConsultantId('')
  }

  const requests = data?.content ?? []
  const filteredRequests = requests.filter((request) =>
    matchesSearch(
      normalizedQuery,
      request.id,
      request.fullName,
      request.phone,
      request.product,
      request.description,
      request.status,
      request.comment,
    ),
  )
  const totalPages = data?.totalPages ?? 1
  const isTerminal = selected ? TERMINAL.includes(selected.status) : false
  const allowedNext = selected ? NEXT_STATUSES[selected.status] : []

  return (
    <Layout title="All Requests">
      <div className="flex gap-1 mb-6 bg-white border border-border rounded-xl p-1 w-fit">
        {TABS.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => { setActiveTab(index); setPage(0) }}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === index ? 'bg-primary text-white' : 'text-muted hover:text-text-main',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border">
        {isLoading ? (
          <p className="p-8 text-center text-muted text-sm">Loading...</p>
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            title={hasSearchQuery ? 'No matching requests' : undefined}
            description={hasSearchQuery ? 'Try a different search term or tab.' : undefined}
          />
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted px-6 py-3">CLIENT</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3">PRODUCT</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3">CONSULTANT</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3">STATUS</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3">CREATED</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => {
                  const consultant = consultantsPage?.content.find((c) => c.id === request.consultantId)
                  return (
                    <tr key={request.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <p className="text-sm font-medium text-text-main">{request.fullName}</p>
                        <p className="text-xs text-muted">{request.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{request.product}</p>
                        <p className="text-xs text-muted truncate max-w-48">{request.description}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {consultant ? consultant.fullName : <span className="text-xs text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={request.status} /></td>
                      <td className="px-4 py-3 text-xs text-muted">{format(parseDate(request.createdAt), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openModal(request)}
                          className="text-xs text-accent hover:underline"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-border">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40">← Prev</button>
                <span className="text-xs text-muted">{page + 1} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40">Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Manage modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl border border-border shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-main">Manage Request</h3>
              <button onClick={closeModal} className="text-muted hover:text-text-main"><X size={18} /></button>
            </div>

            <div className="mb-4 text-sm text-muted space-y-0.5">
              <p><span className="font-medium text-text-main">{selected.product}</span></p>
              <p>{selected.fullName} · {selected.phone}</p>
              <p className="text-xs">{selected.description.slice(0, 100)}{selected.description.length > 100 ? '…' : ''}</p>
            </div>

            {/* Assign consultant */}
            {isTerminal ? (
              <div className="mb-4">
                <label className="form-label">Consultant</label>
                <p className="text-sm text-text-main">
                  {consultantsPage?.content.find((c) => c.id === selected.consultantId)?.fullName ?? '—'}
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <label className="form-label">Assign Consultant</label>
                <select
                  value={assignConsultantId}
                  onChange={(e) => setAssignConsultantId(e.target.value)}
                  className="input-field"
                >
                  <option value="">— Unassigned —</option>
                  {consultantsPage?.content.map((c) => (
                    <option key={c.id} value={c.id}>{c.fullName}{c.specialization ? ` · ${c.specialization}` : ''}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const currentId = selected.consultantId ?? ''
                    if (assignConsultantId !== currentId) {
                      assignConsultant.mutate({
                        id: selected.id,
                        consultantId: assignConsultantId || null,
                      })
                    }
                  }}
                  disabled={assignConsultant.isPending || (assignConsultantId === (selected.consultantId ?? ''))}
                  className="btn-ghost text-xs mt-2 disabled:opacity-40"
                >
                  {assignConsultant.isPending ? 'Saving…' : 'Save assignment'}
                </button>
              </div>
            )}

            {/* Change status */}
            {isTerminal ? (
              <p className="text-xs text-muted bg-gray-50 rounded-lg p-3">
                This request is <strong>{selected.status.toLowerCase()}</strong> — status is final and cannot be changed.
              </p>
            ) : (
              <div>
                <label className="form-label">Change Status</label>
                <div className="flex gap-2 mb-3">
                  {allowedNext.map((s) => (
                    <button
                      key={s}
                      onClick={() => setNewStatus(s)}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                        newStatus === s
                          ? 'bg-primary text-white border-primary'
                          : 'border-border text-muted hover:text-text-main',
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {newStatus && (
                  <>
                    <label className="form-label">Comment (optional)</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                      className="input-field resize-none mb-3"
                      placeholder="Reason or note..."
                    />
                    <button
                      onClick={() => updateStatus.mutate({ id: selected.id, s: newStatus, c: comment || undefined })}
                      disabled={updateStatus.isPending}
                      className="btn-primary w-full text-sm"
                    >
                      {updateStatus.isPending ? 'Saving…' : `Set to ${newStatus}`}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}
