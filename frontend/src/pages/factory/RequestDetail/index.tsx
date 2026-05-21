import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { requestApi } from '@/entities/request/api'
import { conversationApi } from '@/entities/conversation/api'
import {
  ArrowLeft, Package, Truck, MessageSquare,
  ExternalLink, Loader2, Check,
} from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { parseDate } from '@/shared/lib/date'
import toast from 'react-hot-toast'
import { StatusBadge } from '@/shared/ui/StatusBadge'

export default function FactoryRequestDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  const [factoryComment, setFactoryComment] = useState('')
  const [showTracking, setShowTracking] = useState(false)
  const [showComment, setShowComment] = useState(false)

  const { data: request, isLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => requestApi.getById(id!),
    enabled: !!id,
  })

  const trackingMutation = useMutation({
    mutationFn: () =>
      requestApi.updateTracking(id!, {
        trackingNumber: trackingNumber.trim() || undefined,
        trackingUrl: trackingUrl.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['request', id] })
      toast.success('Трекинг обновлён')
      setShowTracking(false)
    },
    onError: () => toast.error('Ошибка обновления'),
  })

  const commentMutation = useMutation({
    mutationFn: () =>
      requestApi
        .update(id!, {})
        .then(() =>
          fetch(`/api/requests/${id}/factory-comment`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}`,
            },
            body: JSON.stringify({ comment: factoryComment.trim() }),
          }),
        ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['request', id] })
      toast.success('Комментарий отправлен')
      setShowComment(false)
      setFactoryComment('')
    },
    onError: () => toast.error('Ошибка отправки'),
  })

  const startChatMutation = useMutation({
    mutationFn: () =>
      conversationApi.create({ requestId: id!, type: 'CONSULTANT_FACTORY' }),
    onSuccess: (conv) => navigate(`/factory/messages/${conv.id}`),
    onError: () => toast.error('Не удалось открыть чат'),
  })

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-[#E8ECF0] rounded-lg w-48" />
        <div className="h-64 bg-[#E8ECF0] rounded-2xl" />
      </div>
    )
  }

  if (!request) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
      className="max-w-3xl mx-auto px-4 py-8"
    >
      <button
        onClick={() => navigate('/factory/requests')}
        className="flex items-center gap-1.5 text-sm text-[#718096] hover:text-[#0C1426] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Мои заявки
      </button>

      <div className="space-y-5">
        {/* Main info */}
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-[#0C1426]">{request.product}</h1>
              <p className="text-xs text-[#718096] font-mono mt-1">
                #{request.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Клиент', value: request.fullName },
              { label: 'Телефон', value: request.phone },
              ...(request.quantity ? [{ label: 'Количество', value: `${request.quantity} ${request.unit ?? ''}` }] : []),
              ...(request.deadline ? [{ label: 'Дедлайн', value: format(new Date(request.deadline), 'dd MMMM yyyy', { locale: ru }) }] : []),
              { label: 'Консультант', value: request.consultantName ?? '—' },
              { label: 'Создана', value: format(parseDate(request.createdAt), 'dd MMM yyyy', { locale: ru }) },
            ].map((row) => (
              <div key={row.label}>
                <p className="text-xs text-[#718096] mb-0.5">{row.label}</p>
                <p className="text-sm font-medium text-[#0C1426]">{row.value}</p>
              </div>
            ))}
          </div>

          {request.description && (
            <div className="mt-4 pt-4 border-t border-[#E8ECF0]">
              <p className="text-xs text-[#718096] mb-1">Описание</p>
              <p className="text-sm text-[#4A5568] bg-[#F5F7FA] rounded-xl px-4 py-3 border border-[#E8ECF0]">
                {request.description}
              </p>
            </div>
          )}
        </div>

        {/* Tracking info */}
        {(request.trackingNumber || request.shippedAt) && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-4 h-4 text-teal-600" />
              <p className="font-semibold text-sm text-[#0C1426]">Информация о доставке</p>
            </div>
            <div className="space-y-2 text-sm">
              {request.trackingNumber && (
                <div className="flex items-center gap-2">
                  <span className="text-[#718096]">Трекинг:</span>
                  {request.trackingUrl ? (
                    <a
                      href={request.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E63946] hover:underline flex items-center gap-1"
                    >
                      {request.trackingNumber} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="font-mono">{request.trackingNumber}</span>
                  )}
                </div>
              )}
              {request.shippedAt && (
                <div className="flex items-center gap-2">
                  <span className="text-[#718096]">Отправлено:</span>
                  <span>{format(new Date(request.shippedAt), 'dd MMM yyyy HH:mm', { locale: ru })}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Update tracking */}
        <div className="card p-5">
          <button
            onClick={() => setShowTracking(!showTracking)}
            className="flex items-center gap-2 text-sm font-semibold text-[#0C1426] w-full text-left"
          >
            <Truck className="w-4 h-4 text-[#E63946]" />
            Обновить трекинг
          </button>

          {showTracking && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="form-label">Номер отслеживания</label>
                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="DHL-123456789"
                  className="input-field"
                />
              </div>
              <div>
                <label className="form-label">Ссылка для трекинга</label>
                <input
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://www.dhl.com/track/..."
                  className="input-field"
                />
              </div>
              <button
                onClick={() => trackingMutation.mutate()}
                disabled={trackingMutation.isPending || (!trackingNumber.trim() && !trackingUrl.trim())}
                className="btn-primary flex items-center gap-2"
              >
                {trackingMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Сохранение…</>
                ) : (
                  <><Check className="w-4 h-4" /> Сохранить трекинг</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Factory comment */}
        <div className="card p-5">
          <button
            onClick={() => setShowComment(!showComment)}
            className="flex items-center gap-2 text-sm font-semibold text-[#0C1426] w-full text-left"
          >
            <MessageSquare className="w-4 h-4 text-[#E63946]" />
            Написать комментарий консультанту
          </button>

          {request.factoryComment && (
            <div className="mt-3 p-3 bg-[#F5F7FA] rounded-xl border border-[#E8ECF0]">
              <p className="text-xs text-[#718096] mb-1">Последний комментарий:</p>
              <p className="text-sm text-[#4A5568]">{request.factoryComment}</p>
            </div>
          )}

          {showComment && (
            <div className="mt-4 space-y-3">
              <textarea
                value={factoryComment}
                onChange={(e) => setFactoryComment(e.target.value)}
                rows={3}
                placeholder="Статус производства, вопросы по заказу..."
                className="input-field resize-none"
              />
              <button
                onClick={() => {
                  if (!factoryComment.trim()) return
                  // Use direct API call with axios
                  import('@/shared/api/axios').then(({ api }) => {
                    api
                      .patch(`/requests/${id}/factory-comment`, { comment: factoryComment.trim() })
                      .then(() => {
                        qc.invalidateQueries({ queryKey: ['request', id] })
                        toast.success('Комментарий отправлен')
                        setShowComment(false)
                        setFactoryComment('')
                      })
                      .catch(() => toast.error('Ошибка отправки'))
                  })
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Отправить
              </button>
            </div>
          )}
        </div>

        {/* Message consultant */}
        <button
          onClick={() => startChatMutation.mutate()}
          disabled={startChatMutation.isPending}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {startChatMutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Открытие чата…</>
          ) : (
            <><MessageSquare className="w-4 h-4" /> Написать консультанту</>
          )}
        </button>
      </div>
    </motion.div>
  )
}
