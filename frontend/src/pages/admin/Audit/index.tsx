import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { Layout } from '@/widgets/Layout'
import { EmptyState } from '@/shared/ui/EmptyState'
import { format } from 'date-fns'
import { parseDate } from '@/shared/lib/date'
import { Search } from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  description: string
  entityType: string
  entityId: string
  createdAt: string
  user?: { id: string; fullName: string; phone: string }
}

interface Page<T> { content: T[]; totalElements: number; totalPages: number }

export default function AdminAudit() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: () => api.get<Page<AuditLog>>('/audit', { params: { page, size: 50 } }).then((r) => r.data),
  })

  const logs = data?.content ?? []
  const totalPages = data?.totalPages ?? 1

  const q = search.trim().toLowerCase()
  const filtered = q
    ? logs.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          (l.description ?? '').toLowerCase().includes(q) ||
          (l.user?.fullName ?? '').toLowerCase().includes(q),
      )
    : logs

  return (
    <Layout title="Audit Log" breadcrumb="ADMIN / AUDIT LOG">
      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, description or user..."
            className="input-field pl-9 w-full text-sm"
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        {isLoading ? (
          <p className="p-10 text-center text-muted text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="No audit logs" description={search ? 'Try a different search term.' : 'Actions will appear here.'} />
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted px-6 py-3 uppercase tracking-wide">Action</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3 uppercase tracking-wide">Description</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3 uppercase tracking-wide">User</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-main max-w-xs truncate">{log.description ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted">{log.user?.fullName ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {format(parseDate(log.createdAt), 'MMM d, yyyy HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && !search && (
              <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-border">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40">← Prev</button>
                <span className="text-xs text-muted">{page + 1} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
