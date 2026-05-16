import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestApi } from '@/entities/request/api'
import { consultantApi } from '@/entities/consultant/api'
import { userApi } from '@/entities/user/api'
import { Layout } from '@/widgets/Layout'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { format, formatDistanceToNow } from 'date-fns'
import { parseDate } from '@/shared/lib/date'
import { useState } from 'react'
import {
  ArrowLeft, Trash2, Clock, User, Phone,
  CalendarDays, RefreshCw, MessageSquare,
  CheckCircle2, Circle, Loader2, Pencil, X, Check,
} from 'lucide-react'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'
import type { RequestStatus } from '@/entities/request/types'

const STEPS: { status: RequestStatus; label: string; sub: string }[] = [
  { status: 'PENDING',   label: 'Submitted',  sub: 'Request received' },
  { status: 'PROGRESS',  label: 'In Progress', sub: 'Consultant working' },
  { status: 'COMPLETED', label: 'Completed',   sub: 'Issue resolved' },
]

const STATUS_CONFIG: Record<RequestStatus, { dot: string; text: string; badge: string; bar: string }> = {
  PENDING:   { dot: 'bg-amber-400',   text: 'text-amber-700',   badge: 'bg-amber-50 text-amber-700 border-amber-200',      bar: 'bg-amber-400' },
  PROGRESS:  { dot: 'bg-blue-500',    text: 'text-blue-700',    badge: 'bg-blue-50 text-blue-700 border-blue-200',         bar: 'bg-blue-500' },
  COMPLETED: { dot: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',bar: 'bg-emerald-500' },
  REJECTED:  { dot: 'bg-gray-400',    text: 'text-gray-600',    badge: 'bg-gray-100 text-gray-600 border-gray-200',        bar: 'bg-gray-400' },
}

const STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: 'Pending', PROGRESS: 'In Progress', COMPLETED: 'Completed', REJECTED: 'Rejected',
}

const AVATAR_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-teal-500', 'bg-rose-500', 'bg-amber-500', 'bg-green-600']

export default function ClientRequestDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [showDelete, setShowDelete] = useState(false)
  const [editing, setEditing]       = useState(false)
  const [editProduct, setEditProduct]         = useState('')
  const [editDescription, setEditDescription] = useState('')

  const { data: request, isLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => requestApi.getById(id!),
    enabled: !!id,
  })

  const { data: consultant } = useQuery({
    queryKey: ['consultant', request?.consultantId],
    queryFn: () => consultantApi.getById(request!.consultantId!),
    enabled: !!request?.consultantId,
  })

  const { data: consultantUser } = useQuery({
    queryKey: ['user', consultant?.userId],
    queryFn: () => userApi.getById(consultant!.userId),
    enabled: !!consultant?.userId,
  })

  const updateMutation = useMutation({
    mutationFn: () => requestApi.update(id!, {
      product: editProduct.trim() || undefined,
      description: editDescription.trim() || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['request', id] })
      qc.invalidateQueries({ queryKey: ['my-requests-all'] })
      toast.success('Request updated')
      setEditing(false)
    },
    onError: () => toast.error('Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => requestApi.delete(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-requests-all'] })
      toast.success('Request deleted')
      navigate('/requests')
    },
    onError: () => toast.error('Failed to delete'),
  })

  function startEdit() {
    if (!request) return
    setEditProduct(request.product)
    setEditDescription(request.description)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
  }

  if (isLoading) {
    return (
      <Layout title="Request Detail" breadcrumb="MY REQUESTS / DETAIL">
        <div className="max-w-5xl animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-72" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </Layout>
    )
  }

  if (!request) return null

  const cfg = STATUS_CONFIG[request.status]
  const isRejected = request.status === 'REJECTED'
  const canEdit = request.status === 'PENDING'
  const stepIdx = isRejected ? -1 : STEPS.findIndex((s) => s.status === request.status)

  const consultantInitials = consultantUser?.fullName
    ?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'
  const colorIdx = consultant ? consultant.id.charCodeAt(0) % AVATAR_COLORS.length : 0

  return (
    <Layout title="Request Detail" breadcrumb="MY REQUESTS / DETAIL">
      <button
        onClick={() => navigate('/requests')}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-text-main transition-colors mb-6"
      >
        <ArrowLeft size={15} /> Back to requests
      </button>

      <div className="max-w-5xl grid grid-cols-5 gap-6 items-start">

        {/* ── Left main ── */}
        <div className="col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className={clsx('h-1.5 w-full', cfg.bar)} />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <input
                      value={editProduct}
                      onChange={(e) => setEditProduct(e.target.value)}
                      className="w-full text-xl font-bold text-text-main bg-gray-50 border border-accent/50 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-accent/20"
                      placeholder="Topic / Product"
                    />
                  ) : (
                    <h1 className="text-xl font-bold text-text-main leading-snug">{request.product}</h1>
                  )}
                  <p className="text-xs text-muted font-mono mt-1 tracking-wider">
                    #{request.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {canEdit && !editing && (
                    <button
                      onClick={startEdit}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted border border-border px-3 py-1.5 rounded-lg hover:border-accent hover:text-accent transition-colors"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                  )}
                  {editing && (
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted border border-border px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X size={12} /> Cancel
                    </button>
                  )}
                  <span className={clsx('inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border', cfg.badge)}>
                    <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                    {STATUS_LABEL[request.status]}
                  </span>
                </div>
              </div>

              {/* Progress stepper */}
              {!isRejected && (
                <div className="mb-6">
                  <div className="flex items-center">
                    {STEPS.map((step, i) => {
                      const done = i < stepIdx
                      const active = i === stepIdx
                      return (
                        <div key={step.status} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={clsx(
                              'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                              done   ? 'bg-accent text-white shadow-sm'
                              : active ? 'bg-accent text-white shadow-md ring-4 ring-accent/20'
                              : 'bg-gray-100 text-muted',
                            )}>
                              {done   ? <CheckCircle2 size={16} />
                              : active ? <Loader2 size={14} className="animate-spin" />
                              : <Circle size={14} />}
                            </div>
                            <div className="text-center">
                              <p className={clsx('text-xs font-semibold', active || done ? 'text-accent' : 'text-muted')}>
                                {step.label}
                              </p>
                              <p className="text-[10px] text-muted hidden sm:block">{step.sub}</p>
                            </div>
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className={clsx(
                              'flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-500',
                              i < stepIdx ? 'bg-accent' : 'bg-gray-200',
                            )} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {isRejected && (
                <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <span>✕</span> This request was declined by the consultant.
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-2">Description</p>
                {editing ? (
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={5}
                    className="w-full text-sm text-gray-700 bg-gray-50 border border-accent/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent/20 resize-none leading-relaxed"
                    placeholder="Describe your request in detail..."
                  />
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-100">
                    {request.description}
                  </p>
                )}
              </div>

              {/* Save button */}
              {editing && (
                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
                  <button onClick={cancelEdit} className="btn-ghost text-sm px-4 py-2">
                    Cancel
                  </button>
                  <button
                    onClick={() => updateMutation.mutate()}
                    disabled={updateMutation.isPending || !editProduct.trim() || !editDescription.trim()}
                    className="btn-primary text-sm px-5 py-2 flex items-center gap-2 disabled:opacity-50"
                  >
                    {updateMutation.isPending
                      ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                      : <><Check size={13} /> Save changes</>
                    }
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Consultant feedback */}
          {request.comment && (
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                  <MessageSquare size={14} className="text-accent" />
                </div>
                <p className="text-sm font-semibold text-text-main">Consultant feedback</p>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed bg-blue-50 rounded-xl px-4 py-3.5 border border-blue-100">
                {request.comment}
              </p>
            </div>
          )}

          {/* Delete */}
          {request.status === 'PENDING' && !editing && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center gap-1.5 text-sm text-danger/70 hover:text-danger transition-colors py-1"
              >
                <Trash2 size={14} /> Delete request
              </button>
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="col-span-2 space-y-4 sticky top-20">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-4">Details</p>
            <div className="space-y-3.5">

              {[
                { icon: <User size={13} />,         label: 'Client',       value: request.fullName },
                { icon: <Phone size={13} />,        label: 'Phone',        value: <span className="font-mono">{request.phone}</span> },
                { icon: <Clock size={13} />,        label: 'Status',       value: (
                  <span className={clsx('inline-flex items-center gap-1.5 text-xs font-semibold', cfg.text)}>
                    <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                    {STATUS_LABEL[request.status]}
                  </span>
                )},
                { icon: <CalendarDays size={13} />, label: 'Created',      value: (
                  <span>{format(parseDate(request.createdAt), 'MMM d, yyyy')}<span className="text-muted ml-1 font-normal">{format(parseDate(request.createdAt), 'HH:mm')}</span></span>
                )},
                { icon: <RefreshCw size={13} />,    label: 'Last updated', value: formatDistanceToNow(parseDate(request.updatedAt), { addSuffix: true }) },
              ].map((row, i, arr) => (
                <div key={row.label}>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-muted">
                      {row.icon}
                    </div>
                    <div>
                      <p className="text-[10px] text-muted uppercase tracking-wide font-semibold">{row.label}</p>
                      <div className="text-sm font-medium text-text-main mt-0.5">{row.value}</div>
                    </div>
                  </div>
                  {i < arr.length - 1 && <div className="h-px bg-gray-100 mt-3.5 ml-10" />}
                </div>
              ))}

            </div>
          </div>

          {consultantUser ? (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
              <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-4">Assigned consultant</p>
              <div className="flex items-center gap-3 mb-3">
                <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm', AVATAR_COLORS[colorIdx])}>
                  {consultantInitials}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-main">{consultantUser.fullName}</p>
                  <p className="text-xs text-muted mt-0.5">{consultant?.specialization}</p>
                </div>
              </div>
              {consultant?.experience && (
                <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 mt-3">
                  <p className="text-[10px] text-muted uppercase tracking-wide font-semibold mb-0.5">Experience</p>
                  <p className="text-xs text-text-main">{consultant.experience}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <User size={18} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-text-main">No consultant yet</p>
              <p className="text-xs text-muted mt-1 leading-relaxed">We'll assign the best match shortly</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete this request?"
        description="This action is permanent and cannot be undone."
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setShowDelete(false)}
        loading={deleteMutation.isPending}
      />
    </Layout>
  )
}
