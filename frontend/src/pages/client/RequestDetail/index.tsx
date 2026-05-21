import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestApi } from '@/entities/request/api'
import { consultantApi } from '@/entities/consultant/api'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { format, formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { parseDate } from '@/shared/lib/date'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Trash2, Clock, User, Phone, Building2,
  CalendarDays, RefreshCw, MessageSquare,
  CheckCircle2, Circle, Loader2, Pencil, X, Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { RequestStatus } from '@/entities/request/types'

const STEPS: { status: RequestStatus; label: string }[] = [
  { status: 'PENDING', label: 'Отправлена' },
  { status: 'PROGRESS', label: 'В работе' },
  { status: 'COMPLETED', label: 'Завершена' },
]

const STATUS_CONFIG: Record<RequestStatus, { badge: string; bar: string; dot: string }> = {
  PENDING:   { badge: 'badge-pending',  bar: 'bg-amber-400', dot: 'bg-amber-400' },
  PROGRESS:  { badge: 'badge-progress', bar: 'bg-blue-500',  dot: 'bg-blue-500' },
  COMPLETED: { badge: 'badge-done',     bar: 'bg-teal-500',  dot: 'bg-teal-500' },
  REJECTED:  { badge: 'badge-rejected', bar: 'bg-gray-300',  dot: 'bg-gray-400' },
}

const STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: 'Ожидает', PROGRESS: 'В работе', COMPLETED: 'Завершена', REJECTED: 'Отклонена',
}

export default function ClientRequestDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [showDelete, setShowDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editProduct, setEditProduct] = useState('')
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

  const updateMutation = useMutation({
    mutationFn: () => requestApi.update(id!, {
      product: editProduct.trim() || undefined,
      description: editDescription.trim() || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['request', id] })
      toast.success('Заявка обновлена')
      setEditing(false)
    },
    onError: () => toast.error('Ошибка обновления'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => requestApi.delete(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-requests'] })
      toast.success('Заявка удалена')
      navigate('/requests')
    },
    onError: () => toast.error('Ошибка удаления'),
  })

  function startEdit() {
    if (!request) return
    setEditProduct(request.product)
    setEditDescription(request.description ?? '')
    setEditing(true)
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-[#E8ECF0] rounded-lg w-48" />
        <div className="h-64 bg-[#E8ECF0] rounded-2xl" />
      </div>
    )
  }

  if (!request) return null

  const cfg = STATUS_CONFIG[request.status]
  const isRejected = request.status === 'REJECTED'
  const canEdit = request.status === 'PENDING'
  const stepIdx = isRejected ? -1 : STEPS.findIndex((s) => s.status === request.status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
      className="max-w-5xl mx-auto px-4 py-8"
    >
      <button
        onClick={() => navigate('/requests')}
        className="flex items-center gap-1.5 text-sm text-[#718096] hover:text-[#0C1426] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Мои заявки
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left */}
        <div className="lg:col-span-3 space-y-5">
          <div className="card overflow-hidden">
            <div className={`h-1.5 w-full ${cfg.bar}`} />
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <input
                      value={editProduct}
                      onChange={(e) => setEditProduct(e.target.value)}
                      className="input-field text-lg font-bold"
                    />
                  ) : (
                    <h1 className="text-xl font-bold text-[#0C1426] leading-snug">{request.product}</h1>
                  )}
                  <p className="text-xs text-[#718096] font-mono mt-1">#{request.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {canEdit && !editing && (
                    <button
                      onClick={startEdit}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#718096] border border-[#E8ECF0] px-3 py-1.5 rounded-lg hover:border-[#E63946] hover:text-[#E63946] transition-colors"
                    >
                      <Pencil className="w-3 h-3" /> Изменить
                    </button>
                  )}
                  {editing && (
                    <button
                      onClick={() => setEditing(false)}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#718096] border border-[#E8ECF0] px-3 py-1.5 rounded-lg hover:bg-[#F5F7FA] transition-colors"
                    >
                      <X className="w-3 h-3" /> Отмена
                    </button>
                  )}
                  <span className={`${cfg.badge} px-3 py-1.5 rounded-full border font-semibold text-xs flex items-center gap-1.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {STATUS_LABEL[request.status]}
                  </span>
                </div>
              </div>

              {/* Stepper */}
              {!isRejected && (
                <div className="mb-6 flex items-center">
                  {STEPS.map((step, i) => {
                    const done = i < stepIdx
                    const active = i === stepIdx
                    return (
                      <div key={step.status} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            done ? 'bg-[#E63946] text-white'
                            : active ? 'bg-[#E63946] text-white ring-4 ring-[#E63946]/20'
                            : 'bg-[#F5F7FA] text-[#718096]'
                          }`}>
                            {done ? <CheckCircle2 className="w-4 h-4" />
                            : active ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Circle className="w-3.5 h-3.5" />}
                          </div>
                          <p className={`text-xs font-semibold ${active || done ? 'text-[#E63946]' : 'text-[#718096]'}`}>
                            {step.label}
                          </p>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all ${i < stepIdx ? 'bg-[#E63946]' : 'bg-[#E8ECF0]'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {isRejected && (
                <div className="mb-5 flex items-center gap-2 text-sm text-[#718096] bg-[#F5F7FA] border border-[#E8ECF0] rounded-xl px-4 py-3">
                  <X className="w-4 h-4" /> Заявка была отклонена консультантом
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-xs font-bold text-[#718096] uppercase tracking-widest mb-2">Описание</p>
                {editing ? (
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={5}
                    className="input-field resize-none"
                  />
                ) : (
                  <p className="text-sm text-[#4A5568] leading-relaxed bg-[#F5F7FA] rounded-xl px-4 py-3.5 border border-[#E8ECF0]">
                    {request.description || '—'}
                  </p>
                )}
              </div>

              {editing && (
                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[#E8ECF0]">
                  <button onClick={() => setEditing(false)} className="btn-ghost">Отмена</button>
                  <button
                    onClick={() => updateMutation.mutate()}
                    disabled={updateMutation.isPending}
                    className="btn-primary flex items-center gap-2"
                  >
                    {updateMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Сохранение…</> : <><Check className="w-4 h-4" /> Сохранить</>}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Comment */}
          {request.comment && (
            <div className="card p-5 border-[#E63946]/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#FEE2E2] flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5 text-[#E63946]" />
                </div>
                <p className="text-sm font-semibold text-[#0C1426]">Комментарий консультанта</p>
              </div>
              <p className="text-sm text-[#4A5568] leading-relaxed bg-[#FEE2E2]/30 rounded-xl px-4 py-3.5 border border-[#E63946]/20">
                {request.comment}
              </p>
            </div>
          )}

          {canEdit && !editing && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center gap-1.5 text-sm text-[#E63946]/70 hover:text-[#E63946] transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Удалить заявку
              </button>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-6">
          <div className="card p-5">
            <p className="text-xs font-bold text-[#718096] uppercase tracking-widest mb-4">Детали заявки</p>
            <div className="space-y-3.5">
              {[
                { icon: User, label: 'Клиент', value: request.fullName },
                { icon: Phone, label: 'Телефон', value: <span className="font-mono">{request.phone}</span> },
                { icon: Clock, label: 'Статус', value: <span className={`${cfg.badge} px-2 py-0.5 rounded-full text-xs font-semibold`}>{STATUS_LABEL[request.status]}</span> },
                { icon: CalendarDays, label: 'Создана', value: format(parseDate(request.createdAt), 'dd MMM yyyy', { locale: ru }) },
                { icon: RefreshCw, label: 'Обновлена', value: formatDistanceToNow(parseDate(request.updatedAt), { locale: ru, addSuffix: true }) },
                ...(request.factoryName ? [{ icon: Building2, label: 'Завод', value: (
                  <Link to={`/factories/${request.factoryId}`} className="text-[#E63946] hover:underline">
                    {request.factoryName}
                  </Link>
                )}] : []),
              ].map((row, i, arr) => (
                <div key={row.label}>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#F5F7FA] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <row.icon className="w-3.5 h-3.5 text-[#718096]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#718096] uppercase tracking-wide font-semibold">{row.label}</p>
                      <div className="text-sm font-medium text-[#0C1426] mt-0.5">{row.value}</div>
                    </div>
                  </div>
                  {i < arr.length - 1 && <div className="h-px bg-[#E8ECF0] mt-3.5 ml-10" />}
                </div>
              ))}
            </div>
          </div>

          {consultant ? (
            <div className="card p-5">
              <p className="text-xs font-bold text-[#718096] uppercase tracking-widest mb-4">Консультант</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-[#0C1426] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {consultant.fullName.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0C1426]">{consultant.fullName}</p>
                  <p className="text-xs text-[#718096] mt-0.5">{consultant.specialization}</p>
                  {consultant.factoryName && (
                    <p className="text-xs text-[#E63946] mt-0.5">{consultant.factoryName}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-5 border-dashed text-center">
              <div className="w-10 h-10 rounded-full bg-[#F5F7FA] flex items-center justify-center mx-auto mb-3">
                <User className="w-5 h-5 text-[#CBD5E0]" />
              </div>
              <p className="text-sm font-semibold text-[#0C1426]">Консультант не назначен</p>
              <p className="text-xs text-[#718096] mt-1">Назначим подходящего специалиста</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Удалить заявку?"
        description="Это действие необратимо."
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setShowDelete(false)}
        loading={deleteMutation.isPending}
      />
    </motion.div>
  )
}
