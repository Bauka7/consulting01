import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { factoryApi } from '@/entities/factory/api'
import { useAuthStore } from '@/features/auth/authStore'
import { ClipboardList, MessageSquare, Building2, Loader2, Package } from 'lucide-react'

export default function FactoryDashboard() {
  const { user } = useAuthStore()

  const { data: factory, isLoading: loadingFactory } = useQuery({
    queryKey: ['my-factory'],
    queryFn: factoryApi.getMyFactory,
  })

  const { data: requests, isLoading: loadingRequests } = useQuery({
    queryKey: ['factory-requests'],
    queryFn: () => factoryApi.getMyRequests({ size: 5 }),
  })

  const totalRequests = requests?.totalElements ?? 0
  const pendingRequests = requests?.content.filter((r) => r.status === 'PROGRESS').length ?? 0

  if (loadingFactory) {
    return (
      <div className="flex justify-center items-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#E63946]" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
      className="max-w-5xl mx-auto px-4 py-8"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0C1426]">
          {factory?.name ?? 'Мой завод'}
        </h1>
        <p className="text-sm text-[#718096] mt-1">Добро пожаловать, {user?.fullName}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-[#718096]">Всего заявок</p>
          </div>
          <p className="text-3xl font-bold text-[#0C1426]">{totalRequests}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-sm font-medium text-[#718096]">В производстве</p>
          </div>
          <p className="text-3xl font-bold text-[#0C1426]">{pendingRequests}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#E63946]" />
            </div>
            <p className="text-sm font-medium text-[#718096]">Завод</p>
          </div>
          <p className="text-base font-bold text-[#0C1426] truncate">{factory?.name ?? '—'}</p>
          <p className="text-xs text-[#718096]">{factory?.location ?? ''}</p>
        </div>
      </div>

      {/* Recent requests */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8ECF0] flex items-center justify-between">
          <h2 className="font-semibold text-[#0C1426]">Последние заявки</h2>
          <Link to="/factory/requests" className="text-sm text-[#E63946] hover:underline">
            Все заявки
          </Link>
        </div>
        {loadingRequests ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#E63946]" />
          </div>
        ) : !requests?.content.length ? (
          <div className="py-12 text-center">
            <ClipboardList className="w-10 h-10 text-[#E8ECF0] mx-auto mb-2" />
            <p className="text-sm text-[#718096]">Заявки пока не назначены</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8ECF0]">
            {requests.content.map((req) => (
              <Link
                key={req.id}
                to={`/factory/requests/${req.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#F5F7FA] transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-[#F5F7FA] flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-[#718096]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0C1426] truncate">{req.product}</p>
                  <p className="text-xs text-[#718096]">{req.fullName}</p>
                </div>
                <span className="text-xs font-medium text-[#718096] bg-[#F5F7FA] px-2 py-1 rounded-full">
                  {req.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Link
          to="/factory/requests"
          className="card p-5 flex items-center gap-3 hover:border-[#E63946] transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center group-hover:bg-[#E63946] transition-colors">
            <ClipboardList className="w-5 h-5 text-[#E63946] group-hover:text-white transition-colors" />
          </div>
          <div>
            <p className="font-semibold text-[#0C1426]">Заявки</p>
            <p className="text-xs text-[#718096]">Управление заказами</p>
          </div>
        </Link>

        <Link
          to="/factory/messages"
          className="card p-5 flex items-center gap-3 hover:border-[#E63946] transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center group-hover:bg-[#E63946] transition-colors">
            <MessageSquare className="w-5 h-5 text-[#E63946] group-hover:text-white transition-colors" />
          </div>
          <div>
            <p className="font-semibold text-[#0C1426]">Сообщения</p>
            <p className="text-xs text-[#718096]">Чат с консультантами</p>
          </div>
        </Link>
      </div>
    </motion.div>
  )
}
