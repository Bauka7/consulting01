import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/entities/user/api'
import { Layout } from '@/widgets/Layout'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { format } from 'date-fns'
import { parseDate } from '@/shared/lib/date'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import type { UserRole } from '@/entities/user/types'
import { clsx } from 'clsx'
import { useAuth } from '@/shared/hooks/useAuth'

const ROLES: UserRole[] = ['CLIENT', 'CONSULTANT', 'ADMIN']

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user: currentUser } = useAuth()
  const isSelf = currentUser?.id === id
  const [showDelete, setShowDelete] = useState(false)

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-detail', id],
    queryFn: () => userApi.getById(id!),
    enabled: !!id,
  })

  const updateRole = useMutation({
    mutationFn: (role: UserRole) => userApi.updateRole(id!, role),
    onSuccess: (updated) => {
      qc.setQueryData(['user-detail', id], updated)
      qc.invalidateQueries({ queryKey: ['admin-users-page'] })
      qc.invalidateQueries({ queryKey: ['admin-users-all'] })
      qc.invalidateQueries({ queryKey: ['admin-consultants'] })
      qc.invalidateQueries({ queryKey: ['consultants-all'] })
      toast.success('Role updated')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Failed to update role'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => userApi.delete(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users-page'] })
      qc.invalidateQueries({ queryKey: ['admin-users-all'] })
      qc.invalidateQueries({ queryKey: ['admin-consultants'] })
      qc.invalidateQueries({ queryKey: ['consultants-all'] })
      toast.success('User deleted')
      navigate('/admin/users')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Failed to delete user'),
  })

  if (isLoading) {
    return <Layout title="User"><div className="animate-pulse h-40 bg-gray-100 rounded-xl" /></Layout>
  }

  if (!user) return null

  const initials = user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <Layout title="User Detail">
      <div className="mb-4">
        <button onClick={() => navigate('/admin/users')} className="flex items-center gap-1.5 text-sm text-muted hover:text-text-main">
          <ArrowLeft size={15} /> Back to users
        </button>
      </div>

      <div className="max-w-lg space-y-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-main">{user.fullName}</h2>
              <p className="text-sm text-muted">{user.phone}</p>
              {user.email && <p className="text-sm text-muted">{user.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-muted mb-0.5">Role</p>
              <p className="text-sm font-semibold">{user.role}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-0.5">Joined</p>
              <p className="text-sm">{format(parseDate(user.createdAt), 'MMM d, yyyy')}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="form-label">Change role</p>
            {isSelf ? (
              <p className="text-xs text-muted bg-gray-50 rounded-lg px-3 py-2">You cannot change your own role.</p>
            ) : (
              <div className="flex gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => updateRole.mutate(role)}
                    disabled={user.role === role || updateRole.isPending}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      user.role === role
                        ? 'bg-primary text-white border-primary'
                        : 'border-border text-muted hover:border-primary hover:text-text-main',
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            {isSelf ? (
              <p className="text-xs text-muted bg-gray-50 rounded-lg px-3 py-2 text-center">You cannot delete your own account.</p>
            ) : (
              <button
                onClick={() => setShowDelete(true)}
                className="btn-danger w-full"
              >
                Delete user
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete user?"
        description={`This will permanently delete ${user.fullName}'s account.`}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setShowDelete(false)}
        loading={deleteMutation.isPending}
      />
    </Layout>
  )
}
