import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/entities/user/api'
import { Layout } from '@/widgets/Layout'
import { EmptyState } from '@/shared/ui/EmptyState'
import { usePageSearch } from '@/shared/hooks/usePageSearch'
import { matchesSearch } from '@/shared/lib/search'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { parseDate } from '@/shared/lib/date'
import { sanitizePhoneInput } from '@/shared/lib/phone'
import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { Download, UserPlus, Users, ShieldCheck, User, Crown, X } from 'lucide-react'
import type { UserRole } from '@/entities/user/types'
import toast from 'react-hot-toast'

type FilterTab = 'ALL' | UserRole

const PHONE_RE = /^\+?[78]\d{10}$/
const PASS_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%.*?&])[A-Za-z\d@$!%.*?&]{6,20}$/

function validate(form: { fullName: string; phone: string; password: string }) {
  return {
    fullName: form.fullName.trim().length < 2 ? 'Min 2 characters' : '',
    phone: !PHONE_RE.test(form.phone) ? 'Enter a valid phone (e.g. +77011112233)' : '',
    password: !PASS_RE.test(form.password)
      ? 'Must include uppercase, lowercase, digit and special char (e.g. Admin@123)'
      : '',
  }
}

function CreateUserModal({
  onClose, form, setForm, onSubmit, isPending,
}: {
  onClose: () => void
  form: { fullName: string; phone: string; password: string; role: UserRole }
  setForm: React.Dispatch<React.SetStateAction<{ fullName: string; phone: string; password: string; role: UserRole }>>
  onSubmit: () => void
  isPending: boolean
}) {
  const [touched, setTouched] = useState({ fullName: false, phone: false, password: false })
  const errors = validate(form)
  const hasErrors = Object.values(errors).some(Boolean)

  function touch(field: keyof typeof touched) {
    setTouched((t) => ({ ...t, [field]: true }))
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text-main">Create User</h2>
          <button onClick={onClose} className="text-muted hover:text-text-main"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          {/* Full name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              className={clsx('input-field w-full', touched.fullName && errors.fullName && 'border-red-400 focus:ring-red-300')}
              placeholder="John Smith"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              onBlur={() => touch('fullName')}
            />
            {touched.fullName && errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              className={clsx('input-field w-full', touched.phone && errors.phone && 'border-red-400 focus:ring-red-300')}
              placeholder="+77022222222"
              value={form.phone}
              maxLength={12}
              onChange={(e) => setForm((f) => ({ ...f, phone: sanitizePhoneInput(e.target.value) }))}
              onBlur={() => touch('phone')}
            />
            {touched.phone && errors.phone
              ? <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              : <p className="text-xs text-muted mt-1">Include country code: +7...</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              className={clsx('input-field w-full', touched.password && errors.password && 'border-red-400 focus:ring-red-300')}
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              onBlur={() => touch('password')}
            />
            {touched.password && errors.password
              ? <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              : <p className="text-xs text-muted mt-1">Uppercase + lowercase + digit + special char (@, !, $...)</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="input-field w-full"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
            >
              <option value="CLIENT">Client</option>
              <option value="CONSULTANT">Consultant</option>
            </select>
            <p className="text-xs text-muted mt-1">To create an Admin, create as Client then promote via User Detail.</p>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={() => { setTouched({ fullName: true, phone: true, password: true }); if (!hasErrors) onSubmit() }}
            disabled={isPending}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All users' },
  { key: 'CLIENT', label: 'Clients' },
  { key: 'CONSULTANT', label: 'Consultants' },
  { key: 'ADMIN', label: 'Admins' },
]

const ROLE_STYLES: Record<UserRole, string> = {
  CLIENT: 'bg-gray-100 text-gray-600',
  CONSULTANT: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-purple-100 text-purple-700',
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-teal-500',
  'bg-rose-500', 'bg-amber-500', 'bg-green-600', 'bg-gray-700', 'bg-indigo-500',
]

export default function AdminUsers() {
  const qc = useQueryClient()
  const location = useLocation()
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL')
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    if ((location.state as any)?.openCreate) {
      setShowCreate(true)
      window.history.replaceState({}, '')
    }
  }, [])
  const [form, setForm] = useState({ fullName: '', phone: '', password: '', role: 'CLIENT' as UserRole })
  const { normalizedQuery, hasSearchQuery } = usePageSearch()

  const createUser = useMutation({
    mutationFn: () => userApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users-page'] })
      toast.success('User created')
      setShowCreate(false)
      setForm({ fullName: '', phone: '', password: '', role: 'CLIENT' })
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Failed to create user'),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users-page', page],
    queryFn: () => userApi.getAll({ page, size: 20 }),
  })

  const users = data?.content ?? []
  const totalPages = data?.totalPages ?? 1

  const searchFiltered = users.filter((user) =>
    matchesSearch(normalizedQuery, user.fullName, user.phone, user.email, user.role),
  )

  const tabFiltered = searchFiltered.filter((u) => activeTab === 'ALL' || u.role === activeTab)

  const counts = {
    ALL: searchFiltered.length,
    CLIENT: searchFiltered.filter((u) => u.role === 'CLIENT').length,
    CONSULTANT: searchFiltered.filter((u) => u.role === 'CONSULTANT').length,
    ADMIN: searchFiltered.filter((u) => u.role === 'ADMIN').length,
  }

  function handleExportCsv() {
    if (tabFiltered.length === 0) return
    const rows = [
      ['Full name', 'Phone', 'Email', 'Role', 'Joined'],
      ...tabFiltered.map((u) => [
        u.fullName, u.phone, u.email ?? '', u.role,
        format(parseDate(u.createdAt), 'yyyy-MM-dd'),
      ]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'users.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout
      title="Users & Roles"
      breadcrumb="ADMIN / USERS"
      actions={
        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            disabled={tabFiltered.length === 0}
            className="btn-ghost text-sm flex items-center gap-1.5 disabled:opacity-40"
          >
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm flex items-center gap-1.5">
            <UserPlus size={14} /> Create User
          </button>
        </div>
      }
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted uppercase tracking-wide font-semibold">Total Users</p>
            <Users size={16} className="text-muted" />
          </div>
          <p className="text-3xl font-black text-text-main">{data?.totalElements ?? 0}</p>
          <p className="text-xs text-success mt-1">{hasSearchQuery ? 'Filtered results' : 'All registered'}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted uppercase tracking-wide font-semibold">Clients</p>
            <User size={16} className="text-muted" />
          </div>
          <p className="text-3xl font-black text-text-main">{counts.CLIENT}</p>
          <p className="text-xs text-muted mt-1">Active clients</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted uppercase tracking-wide font-semibold">Consultants</p>
            <ShieldCheck size={16} className="text-muted" />
          </div>
          <p className="text-3xl font-black text-text-main">{counts.CONSULTANT}</p>
          <p className="text-xs text-muted mt-1">On platform</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/50 uppercase tracking-wide font-semibold">Admins</p>
            <Crown size={16} className="text-white/30" />
          </div>
          <p className="text-3xl font-black text-white">{counts.ADMIN}</p>
          <p className="text-xs text-white/40 mt-1">Platform admins</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        {/* Filter tabs */}
        <div className="flex items-center justify-between px-6 py-0 border-b border-border">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'px-4 py-3.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                  activeTab === tab.key
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted hover:text-text-main',
                )}
              >
                {tab.label}
                <span className={clsx('ml-1.5 text-xs', activeTab === tab.key ? 'text-accent' : 'text-muted')}>
                  · {counts[tab.key] ?? searchFiltered.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="p-10 text-center text-muted text-sm">Loading...</p>
        ) : tabFiltered.length === 0 ? (
          <EmptyState
            title={hasSearchQuery ? 'No matching users' : 'No users yet'}
            description={hasSearchQuery ? 'Try a different search term.' : undefined}
          />
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted px-6 py-3 uppercase tracking-wide">User</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3 uppercase tracking-wide">Role</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3 uppercase tracking-wide">Joined</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3 uppercase tracking-wide">Status</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tabFiltered.map((user) => {
                  const initials = user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                  const colorIdx = user.id.charCodeAt(0) % AVATAR_COLORS.length
                  return (
                    <tr key={user.id} onClick={() => navigate(`/admin/users/${user.id}`)} className="border-b border-border last:border-0 hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0', AVATAR_COLORS[colorIdx])}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-main">{user.fullName}</p>
                            <p className="text-xs text-muted">{user.email ?? user.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full', ROLE_STYLES[user.role])}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted">
                        {format(parseDate(user.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                          <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            className="text-xs text-muted border border-border px-2.5 py-1 rounded-lg hover:text-text-main hover:border-gray-300 transition-colors"
                          >
                            Role
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-border">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="text-xs text-muted px-2">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {showCreate && (
        <CreateUserModal
          onClose={() => { setShowCreate(false); setForm({ fullName: '', phone: '', password: '', role: 'CLIENT' }) }}
          form={form}
          setForm={setForm}
          onSubmit={() => createUser.mutate()}
          isPending={createUser.isPending}
        />
      )}
    </Layout>
  )
}
