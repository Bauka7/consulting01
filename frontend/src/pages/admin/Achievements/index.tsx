import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { achievementApi } from '@/entities/achievement/api'
import { userApi } from '@/entities/user/api'
import { Layout } from '@/widgets/Layout'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { usePageSearch } from '@/shared/hooks/usePageSearch'
import { matchesSearch } from '@/shared/lib/search'
import { format } from 'date-fns'
import { parseDate } from '@/shared/lib/date'
import { Plus, Trash2, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminAchievements() {
  const qc = useQueryClient()
  const { normalizedQuery, hasSearchQuery } = usePageSearch()
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [createData, setCreateData] = useState({ userId: '', description: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-achievements'],
    queryFn: () => achievementApi.getAll({ page: 0, size: 50 }),
  })

  const { data: usersPage } = useQuery({
    queryKey: ['admin-users-all'],
    queryFn: () => userApi.getAll({ page: 0, size: 200 }),
  })

  const createMutation = useMutation({
    mutationFn: () => achievementApi.create(createData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-achievements'] })
      setShowCreate(false)
      setCreateData({ userId: '', description: '' })
      toast.success('Achievement created')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Failed to create achievement'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => achievementApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-achievements'] })
      setDeleteId(null)
      toast.success('Achievement deleted')
    },
    onError: () => toast.error('Failed to delete achievement'),
  })

  const achievements = data?.content ?? []
  const usersById = new Map((usersPage?.content ?? []).map((user) => [user.id, user]))
  const filteredAchievements = achievements.filter((achievement) => {
    const user = usersById.get(achievement.userId)
    return matchesSearch(normalizedQuery, achievement.description, user?.fullName, user?.phone, user?.email)
  })

  return (
    <Layout
      title="Achievements"
      actions={
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus size={14} /> Award achievement
        </button>
      }
    >
      {showCreate && (
        <div className="bg-card rounded-xl border border-border p-5 mb-6 max-w-md">
          <h3 className="font-semibold text-sm mb-4">Award achievement</h3>
          <div className="space-y-3">
            <div>
              <label className="form-label">User</label>
              <select value={createData.userId} onChange={(event) => setCreateData({ ...createData, userId: event.target.value })} className="input-field">
                <option value="">Select user...</option>
                {usersPage?.content.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Description</label>
              <input value={createData.description} onChange={(event) => setCreateData({ ...createData, description: event.target.value })} className="input-field" placeholder="Completed 100 engagements" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!createData.userId || !createData.description || createMutation.isPending}
                className="btn-primary flex-1"
              >
                {createMutation.isPending ? 'Saving...' : 'Award'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border max-w-3xl">
        {isLoading ? (
          <p className="p-8 text-center text-muted text-sm">Loading...</p>
        ) : filteredAchievements.length === 0 ? (
          <EmptyState
            title={hasSearchQuery ? 'No matching achievements' : undefined}
            description={hasSearchQuery ? 'Try a different search term.' : undefined}
          />
        ) : (
          <div className="divide-y divide-border">
            {filteredAchievements.map((achievement) => {
              const user = usersById.get(achievement.userId)
              return (
                <div key={achievement.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trophy size={14} className="text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-main">{achievement.description}</p>
                    <p className="text-xs text-muted">
                      {user?.fullName ?? 'Unknown user'} · {format(parseDate(achievement.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <button onClick={() => setDeleteId(achievement.id)} className="p-1.5 text-muted hover:text-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete achievement?"
        description="This will remove the achievement."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </Layout>
  )
}
