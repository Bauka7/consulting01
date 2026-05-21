import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { factoryApi } from '@/entities/factory/api'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { Package, Loader2, ClipboardList } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { parseDate } from '@/shared/lib/date'

export default function FactoryRequests() {
  const { data: requests, isLoading } = useQuery({
    queryKey: ['factory-requests-all'],
    queryFn: () => factoryApi.getMyRequests({ size: 50 }),
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
      className="max-w-5xl mx-auto px-4 py-8"
    >
      <PageHeader title="Мои заявки" subtitle="Заказы, назначенные вашему заводу" />

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#E63946]" />
          </div>
        ) : !requests?.content.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardList className="w-12 h-12 text-[#E8ECF0] mb-3" />
            <p className="font-semibold text-[#0C1426]">Нет заявок</p>
            <p className="text-sm text-[#718096] mt-1">Заявки появятся, когда консультант назначит вас</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8ECF0]">
            {requests.content.map((req) => (
              <Link
                key={req.id}
                to={`/factory/requests/${req.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#F5F7FA] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F5F7FA] flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-[#718096]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0C1426] truncate">{req.product}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#718096]">{req.fullName}</span>
                    {req.quantity && (
                      <span className="text-xs text-[#718096]">
                        · {req.quantity} {req.unit}
                      </span>
                    )}
                    {req.deadline && (
                      <span className="text-xs text-[#718096]">
                        · до {format(new Date(req.deadline), 'dd MMM', { locale: ru })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-[#718096]">
                    {format(parseDate(req.createdAt), 'dd MMM', { locale: ru })}
                  </span>
                  <StatusBadge status={req.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
