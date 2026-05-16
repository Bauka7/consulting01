import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestApi } from '@/entities/request/api'
import { Layout } from '@/widgets/Layout'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { format } from 'date-fns'
import { parseDate } from '@/shared/lib/date'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import type { RequestStatus } from '@/entities/request/types'

export default function ConsultantRequestDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [comment, setComment] = useState('')

  const { data: request, isLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => requestApi.getById(id!),
    enabled: !!id,
  })

  const updateStatus = useMutation({
    mutationFn: ({ status, c }: { status: RequestStatus; c?: string }) =>
      requestApi.updateStatus(id!, status, c),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['request', id] })
      qc.invalidateQueries({ queryKey: ['consultant-requests'] })
      toast.success('Status updated')
    },
    onError: () => toast.error('Failed to update'),
  })

  if (isLoading || !request) {
    return (
      <Layout title="Request">
        <div className="animate-pulse h-40 bg-gray-100 rounded-xl" />
      </Layout>
    )
  }

  return (
    <Layout title="Request Detail">
      <div className="mb-4">
        <button
          onClick={() => navigate('/consultant/requests')}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-text-main"
        >
          <ArrowLeft size={15} /> Back to requests
        </button>
      </div>

      <div className="max-w-2xl space-y-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-text-main">{request.product}</h2>
              <p className="text-xs text-muted font-mono">#{request.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted mb-0.5">Client</p>
              <p className="text-sm font-medium">{request.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-0.5">Phone</p>
              <p className="text-sm font-medium">{request.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-0.5">Created</p>
              <p className="text-sm">{format(parseDate(request.createdAt), 'MMM d, yyyy HH:mm')}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-muted mb-1">Description</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{request.description}</p>
          </div>

          {request.comment && (
            <div className="mb-4">
              <p className="text-xs text-muted mb-1">Previous comment</p>
              <p className="text-sm bg-blue-50 border border-blue-100 rounded-lg p-3">{request.comment}</p>
            </div>
          )}

          {(request.status === 'PENDING' || request.status === 'PROGRESS') && (
            <div className="space-y-3 pt-3 border-t border-border">
              <div>
                <label className="form-label">Comment (optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Add a note for the client..."
                />
              </div>

              <div className="flex gap-2">
                {request.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => updateStatus.mutate({ status: 'REJECTED', c: comment })}
                      disabled={updateStatus.isPending}
                      className="btn-ghost flex-1"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => updateStatus.mutate({ status: 'PROGRESS', c: comment })}
                      disabled={updateStatus.isPending}
                      className="btn-primary flex-1"
                    >
                      Accept
                    </button>
                  </>
                )}
                {request.status === 'PROGRESS' && (
                  <button
                    onClick={() => updateStatus.mutate({ status: 'COMPLETED', c: comment })}
                    disabled={updateStatus.isPending}
                    className="btn-primary flex-1"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
