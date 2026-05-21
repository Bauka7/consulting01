import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Building2, MapPin, Package, Users, ArrowLeft, MessageSquare, FileText, Truck, Shield, Zap } from 'lucide-react'
import { factoryApi } from '@/entities/factory/api'
import { useAuthStore } from '@/features/auth/authStore'

export default function FactoryDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()

  const { data: factory, isLoading } = useQuery({
    queryKey: ['factory', id],
    queryFn: () => factoryApi.getById(id!),
    enabled: !!id,
  })

  const { data: consultantsPage } = useQuery({
    queryKey: ['factory-consultants', id],
    queryFn: () => factoryApi.getConsultants(id!, { size: 6 }),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="animate-pulse max-w-6xl mx-auto px-4 py-8">
        <div className="h-80 bg-[#E8ECF0] rounded-2xl mb-8" />
        <div className="h-8 bg-[#E8ECF0] rounded w-1/3 mb-4" />
        <div className="h-4 bg-[#E8ECF0] rounded w-2/3" />
      </div>
    )
  }

  if (!factory) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
    >
      {/* Hero */}
      <div className="relative h-72 md:h-80 bg-gradient-to-br from-[#0C1426] to-[#1A2540] overflow-hidden">
        {factory.imageUrl ? (
          <img src={factory.imageUrl} alt={factory.name} className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-24 h-24 text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <Link
            to="/factories"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Все заводы
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">{factory.name}</h1>
          {factory.location && (
            <div className="flex items-center gap-1.5 mt-2 text-white/70">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{factory.location}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8 flex-col lg:flex-row">
          {/* Left */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* About */}
            {factory.description && (
              <div className="card p-6">
                <h2 className="font-display font-bold text-[#0C1426] mb-3 section-divider">О заводе</h2>
                <p className="text-[#4A5568] leading-relaxed">{factory.description}</p>
              </div>
            )}

            {/* Categories */}
            {factory.categories.length > 0 && (
              <div className="card p-6">
                <h2 className="font-display font-bold text-[#0C1426] mb-4 section-divider">Категории товаров</h2>
                <div className="flex flex-wrap gap-2">
                  {factory.categories.map((cat) => (
                    <span key={cat.id} className="category-tag text-sm px-3 py-1.5">
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Consultants */}
            {consultantsPage && consultantsPage.content.length > 0 && (
              <div className="card p-6">
                <h2 className="font-display font-bold text-[#0C1426] mb-4 section-divider">
                  Консультанты завода
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {consultantsPage.content.map((c) => (
                    <Link
                      key={c.id}
                      to={`/consultants/${c.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[#E8ECF0] hover:border-[#E63946] hover:bg-[#FEE2E2]/30 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#0C1426] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {c.fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#0C1426] truncate">{c.fullName}</p>
                        <p className="text-xs text-[#718096] truncate">{c.specialization}</p>
                      </div>
                      <MessageSquare className="w-4 h-4 text-[#E63946] ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Contact disclaimer */}
            <div className="card p-4 bg-[#F5F7FA] border-dashed">
              <p className="text-sm text-[#718096] text-center">
                Контакты завода доступны только через консультанта. Свяжитесь с консультантом, чтобы получить прямые контакты.
              </p>
            </div>
          </div>

          {/* Right sticky card */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="card p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#E63946]" />
                </div>
                <div>
                  <p className="font-semibold text-[#0C1426]">Интересует товар?</p>
                  <p className="text-xs text-[#718096]">Оставьте заявку</p>
                </div>
              </div>

              <p className="text-sm text-[#4A5568] mb-5 leading-relaxed">
                Оставьте заявку и консультант свяжется с вами в течение 2 часов
              </p>

              {user ? (
                <Link
                  to={`/requests/new?factoryId=${factory.id}`}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Создать заявку
                </Link>
              ) : (
                <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
                  Войти и создать заявку
                </Link>
              )}

              <div className="mt-5 space-y-2.5 pt-5 border-t border-[#E8ECF0]">
                {[
                  { icon: Shield, text: 'Без предоплаты' },
                  { icon: Zap, text: 'Ответ за 2 часа' },
                  { icon: Truck, text: 'Доставка по всему миру' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm text-[#4A5568]">
                    <Icon className="w-4 h-4 text-[#718096] flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {consultantsPage && (
                <div className="mt-4 pt-4 border-t border-[#E8ECF0]">
                  <div className="flex items-center gap-2 text-sm text-[#718096]">
                    <Users className="w-4 h-4" />
                    <span>{consultantsPage.totalElements} консультантов</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
