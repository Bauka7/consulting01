import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { consultantApi } from '@/entities/consultant/api'
import { userApi } from '@/entities/user/api'
import type { UserDto } from '@/entities/user/types'
import { Layout } from '@/widgets/Layout'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { usePageSearch } from '@/shared/hooks/usePageSearch'
import { matchesSearch } from '@/shared/lib/search'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { parseDate } from '@/shared/lib/date'

export default function AdminConsultants() {
  const qc = useQueryClient()
  const { normalizedQuery, hasSearchQuery } = usePageSearch()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-consultants'],
    queryFn: () => consultantApi.getAll({ page: 0, size: 50 }),
  })

  const { data: usersPage } = useQuery({
    queryKey: ['admin-users-all'],
    queryFn: () => userApi.getAll({ page: 0, size: 200 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => consultantApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-consultants'] })
      qc.invalidateQueries({ queryKey: ['consultants-all'] })
      setDeleteId(null)
      toast.success('Consultant deleted')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to delete consultant'),
  })

  const consultants = data?.content ?? []
  const users = usersPage?.content ?? []
  const usersById = new Map(users.map((user) => [user.id, user]))

  const filteredConsultants = consultants.filter((consultant) => {
    const user = usersById.get(consultant.userId)
    return matchesSearch(
      normalizedQuery,
      consultant.specialization,
      consultant.experience,
      user?.fullName,
      user?.phone,
      user?.email,
    )
  })

  return (
    <Layout title="Consultants">

      <div className="bg-card rounded-xl border border-border">
        {isLoading ? (
          <p className="p-8 text-center text-muted text-sm">Loading...</p>
        ) : filteredConsultants.length === 0 ? (
          <EmptyState
            title={hasSearchQuery ? 'No matching consultants' : 'No consultants yet'}
            description={hasSearchQuery ? 'Try a different search term.' : 'Assign the Consultant role to a user to create a consultant profile.'}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted px-6 py-3">CONSULTANT</th>
                <th className="text-left text-xs font-medium text-muted px-4 py-3">SPECIALIZATION</th>
                <th className="text-left text-xs font-medium text-muted px-4 py-3">EXPERIENCE</th>
                <th className="text-left text-xs font-medium text-muted px-4 py-3">JOINED</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredConsultants.map((consultant) => (
                <ConsultantRow
                  key={consultant.id}
                  consultant={consultant}
                  user={usersById.get(consultant.userId)}
                  onDelete={() => setDeleteId(consultant.id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete consultant?"
        description="This removes the consultant profile. The user account remains."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </Layout>
  )
}

function ConsultantRow({
  consultant,
  user,
  onDelete,
}: {
  consultant: import('@/entities/consultant/types').ConsultantDto
  user?: UserDto
  onDelete: () => void
}) {
  const initials = consultant.fullName?.split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <tr className="border-b border-border last:border-0 hover:bg-gray-50">
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
          <div>
            <p className="text-sm font-medium">{consultant.fullName ?? '—'}</p>
            <p className="text-xs text-muted">{user?.phone ?? ''}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm">{consultant.specialization}</td>
      <td className="px-4 py-3 text-sm">{consultant.experience}</td>
      <td className="px-4 py-3 text-xs text-muted">{format(parseDate(consultant.createdAt), 'MMM d, yyyy')}</td>
      <td className="px-4 py-3">
        <button onClick={onDelete} className="p-1.5 text-muted hover:text-danger">
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  )
}
