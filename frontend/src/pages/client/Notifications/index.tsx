import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '@/entities/notification/api'
import { Layout } from '@/widgets/Layout'
import { EmptyState } from '@/shared/ui/EmptyState'
import { usePageSearch } from '@/shared/hooks/usePageSearch'
import { matchesSearch } from '@/shared/lib/search'
import { formatDistanceToNow } from 'date-fns'
import { parseDate } from '@/shared/lib/date'
import { Bell, Check, Trash2, X, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/features/auth/authStore'

export default function ClientNotifications() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { normalizedQuery, hasSearchQuery } = usePageSearch()
  const user = useAuthStore((s) => s.user)

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getMy({ page: 0, size: 50 }),
    refetchInterval: 30_000,
  })

  const markRead = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-count'] })
    },
  })

  const deleteOne = useMutation({
    mutationFn: (id: string) => notificationApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-count'] })
      toast.success('Deleted')
    },
  })

  const deleteAll = useMutation({
    mutationFn: () => notificationApi.deleteAll(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-count'] })
      toast.success('All notifications cleared')
    },
  })

  const notifications = data?.content ?? []
  const filtered = notifications.filter((n) => matchesSearch(normalizedQuery, n.message))
  const unreadCount = notifications.filter((n) => !n.isRead).length

  function handleClick(id: string, requestId: string | null, isRead: boolean) {
    if (!isRead) markRead.mutate(id)
    if (requestId) {
      const role = user?.role
      if (role === 'CONSULTANT') navigate(`/consultant/requests/${requestId}`)
      else if (role === 'ADMIN') navigate(`/admin/requests`)
      else navigate(`/requests/${requestId}`)
    }
  }

  return (
    <Layout
      title="Notifications"
      breadcrumb="WORKSPACE / NOTIFICATIONS"
      actions={
        filtered.length > 0 ? (
          <button
            onClick={() => deleteAll.mutate()}
            disabled={deleteAll.isPending}
            className="btn-ghost text-sm flex items-center gap-1.5"
          >
            <X size={14} /> Clear all
          </button>
        ) : undefined
      }
    >
      <div className="max-w-2xl">
        {/* Unread count header */}
        {unreadCount > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">
              <span className="font-semibold text-text-main">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => filtered.filter((n) => !n.isRead).forEach((n) => markRead.mutate(n.id))}
              className="text-xs text-accent hover:text-accent/80 font-medium transition-colors"
            >
              Mark all as read
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-4 animate-pulse h-20" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={hasSearchQuery ? 'No matching notifications' : 'No notifications'}
            description={hasSearchQuery ? 'Try a different search term.' : "You're all caught up."}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => {
              const hasLink = !!n.requestId
              const Wrapper = hasLink ? 'button' : 'div'

              return (
                <div
                  key={n.id}
                  className={clsx(
                    'group bg-white rounded-2xl border shadow-sm overflow-hidden transition-all',
                    !n.isRead ? 'border-accent/30' : 'border-border',
                    hasLink && 'hover:shadow-md hover:border-accent/40 cursor-pointer',
                  )}
                  onClick={() => hasLink && handleClick(n.id, n.requestId, n.isRead)}
                >
                  {/* Unread accent bar */}
                  {!n.isRead && <div className="h-0.5 w-full bg-accent" />}

                  <div className="flex items-start gap-3 p-4">
                    {/* Icon */}
                    <div className={clsx(
                      'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
                      n.isRead ? 'bg-gray-100' : 'bg-accent/10',
                    )}>
                      <Bell size={15} className={n.isRead ? 'text-muted' : 'text-accent'} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={clsx(
                        'text-sm leading-snug',
                        n.isRead ? 'text-gray-500' : 'text-text-main font-medium',
                      )}>
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <p className="text-xs text-muted">
                          {formatDistanceToNow(parseDate(n.createdAt), { addSuffix: true })}
                        </p>
                        {hasLink && (
                          <span className={clsx(
                            'text-xs font-medium flex items-center gap-0.5 transition-colors',
                            n.isRead ? 'text-muted group-hover:text-accent' : 'text-accent',
                          )}>
                            Open request <ChevronRight size={11} />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      className="flex gap-1 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!n.isRead && (
                        <button
                          onClick={() => markRead.mutate(n.id)}
                          className="p-1.5 text-muted hover:text-accent transition-colors rounded-lg hover:bg-accent/10"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteOne.mutate(n.id)}
                        className="p-1.5 text-muted hover:text-danger transition-colors rounded-lg hover:bg-danger/10"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
