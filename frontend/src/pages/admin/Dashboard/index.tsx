import { useQuery } from '@tanstack/react-query'
import { requestApi } from '@/entities/request/api'
import { userApi } from '@/entities/user/api'
import { consultantApi } from '@/entities/consultant/api'
import { Layout } from '@/widgets/Layout'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { usePageSearch } from '@/shared/hooks/usePageSearch'
import { matchesSearch } from '@/shared/lib/search'
import { Link, useNavigate } from 'react-router-dom'
import { format, subDays } from 'date-fns'
import { parseDate } from '@/shared/lib/date'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import type { RequestStatus } from '@/entities/request/types'

const STATUS_COLORS: Record<RequestStatus, string> = {
  PENDING: '#F59E0B',
  PROGRESS: '#3B82F6',
  COMPLETED: '#10B981',
  REJECTED: '#6B7280',
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { normalizedQuery, hasSearchQuery } = usePageSearch()

  const { data: usersPage } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => userApi.getAll({ page: 0, size: 100 }),
  })

  const { data: requestsPage } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: () => requestApi.getAll({ page: 0, size: 200 }),
  })

  const { data: consultantsPage } = useQuery({
    queryKey: ['consultants-all'],
    queryFn: () => consultantApi.getAll({ page: 0, size: 100 }),
  })

  const users = usersPage?.content ?? []
  const requests = requestsPage?.content ?? []
  const consultants = consultantsPage?.content ?? []
  const filteredRequests = requests.filter((request) =>
    matchesSearch(
      normalizedQuery,
      request.id,
      request.fullName,
      request.phone,
      request.product,
      request.description,
      request.status,
      request.comment,
    ),
  )

  const counts: Record<RequestStatus, number> = { PENDING: 0, PROGRESS: 0, COMPLETED: 0, REJECTED: 0 }
  filteredRequests.forEach((request) => counts[request.status]++)

  const pieData = Object.entries(counts)
    .filter(([, value]) => value > 0)
    .map(([status, value]) => ({
      name: status === 'PROGRESS' ? 'In Progress' : status.charAt(0) + status.slice(1).toLowerCase(),
      value,
      status: status as RequestStatus,
    }))

  const today = new Date()
  const chartData = Array.from({ length: 30 }, (_, index) => {
    const date = subDays(today, 29 - index)
    const dateStr = format(date, 'MMM d')
    const count = filteredRequests.filter((request) => format(parseDate(request.createdAt), 'MMM d') === dateStr).length
    return { date: dateStr, requests: count }
  })

  const recentRequests = filteredRequests.slice(0, 5)

  return (
    <Layout title="Platform" actions={<button onClick={() => navigate('/admin/users', { state: { openCreate: true } })} className="btn-primary text-sm">+ Create User</button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users.length, sub: `${consultants.length} consultants · ${users.length - consultants.length} clients` },
          { label: 'Consultants', value: consultants.length, sub: consultants.length === 0 ? 'No consultants yet' : `${counts.PROGRESS} currently active` },
          { label: 'Active Requests', value: counts.PROGRESS + counts.PENDING, sub: `${counts.PENDING} pending · ${counts.PROGRESS} in progress` },
          { label: 'Match Rate', value: `${filteredRequests.length > 0 ? Math.round((counts.COMPLETED / filteredRequests.length) * 100) : 0}%`, sub: `${counts.COMPLETED} of ${filteredRequests.length} completed` },
        ].map((card) => (
          <div key={card.label} className="bg-card rounded-xl border border-border p-5">
            <p className="text-xs text-muted uppercase tracking-wide mb-2">{card.label}</p>
            <p className="text-3xl font-black text-text-main">{card.value}</p>
            <p className="text-xs text-success mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-text-main mb-4">Requests - last 30 days</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-text-main mb-4">Status breakdown</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                    {pieData.map((item) => (
                      <Cell key={item.name} fill={STATUS_COLORS[item.status]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[item.status] }} />
                      <span className="text-muted">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted text-sm text-center py-8">
              {hasSearchQuery ? 'No matching requests' : 'No data'}
            </p>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-text-main">Recent requests</h3>
          <Link to="/admin/requests" className="text-xs text-muted hover:text-text-main">View all</Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted px-6 py-3">CLIENT</th>
              <th className="text-left text-xs font-medium text-muted px-4 py-3">PRODUCT</th>
              <th className="text-left text-xs font-medium text-muted px-4 py-3">STATUS</th>
              <th className="text-left text-xs font-medium text-muted px-4 py-3">DATE</th>
            </tr>
          </thead>
          <tbody>
            {recentRequests.map((request) => (
              <tr key={request.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                <td className="px-6 py-3 text-sm">{request.fullName}</td>
                <td className="px-4 py-3 text-sm text-text-main">{request.product}</td>
                <td className="px-4 py-3"><StatusBadge status={request.status} /></td>
                <td className="px-4 py-3 text-xs text-muted">{format(parseDate(request.createdAt), 'MMM d')}</td>
              </tr>
            ))}
            {recentRequests.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-muted text-sm">{hasSearchQuery ? 'No matching requests' : 'No requests'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
