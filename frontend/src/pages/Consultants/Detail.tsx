import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Building2, FileText, Star, Lock } from 'lucide-react'
import { consultantApi } from '@/entities/consultant/api'
import { contactLinkApi } from '@/entities/contactLink/api'
import { achievementApi } from '@/entities/achievement/api'
import { useAuth } from '@/shared/hooks/useAuth'
import { requestApi } from '@/entities/request/api'

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

const MOCK_REVIEWS = [
  { id: '1', name: 'Асанов Б.', text: 'Отличный специалист! Быстро нашёл нужный товар по хорошей цене.', rating: 5 },
  { id: '2', name: 'Смагулова Д.', text: 'Профессиональный подход, знает китайский рынок досконально.', rating: 5 },
  { id: '3', name: 'Жумаев Е.', text: 'Помог с доставкой и таможней. Рекомендую!', rating: 4 },
]

export default function ConsultantDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const { data: consultant, isLoading } = useQuery({
    queryKey: ['consultant', id],
    queryFn: () => consultantApi.getById(id!),
    enabled: !!id,
  })

  const { data: contactLinks } = useQuery({
    queryKey: ['contact-links', consultant?.userId],
    queryFn: () => contactLinkApi.getByUser(consultant!.userId),
    enabled: !!consultant?.userId,
  })

  const { data: achievements } = useQuery({
    queryKey: ['achievements', consultant?.userId],
    queryFn: () => achievementApi.getByUser(consultant!.userId),
    enabled: !!consultant?.userId,
  })

  const { data: myRequests } = useQuery({
    queryKey: ['my-requests-for-consultant'],
    queryFn: () => requestApi.getMy({}),
    enabled: !!user && user.role === 'CLIENT',
  })

  const hasActiveRequest = myRequests?.content.some(
    (r) => r.consultantId === id && (r.status === 'PENDING' || r.status === 'PROGRESS')
  )

  if (isLoading) {
    return (
      <div className="animate-pulse max-w-6xl mx-auto px-4 py-8">
        <div className="h-64 bg-[#E8ECF0] rounded-2xl mb-8" />
        <div className="h-6 bg-[#E8ECF0] rounded w-1/3 mb-3" />
        <div className="h-4 bg-[#E8ECF0] rounded w-2/3" />
      </div>
    )
  }

  if (!consultant) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Hero — Chinese business card style */}
      <div className="relative bg-gradient-to-br from-[#0C1426] to-[#1A2540] overflow-hidden">
        {/* SVG grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-8 pb-10">
          <Link to="/consultants" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Все консультанты
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-full border-2 border-[#E63946] flex items-center justify-center text-white text-2xl font-bold bg-[#E63946]/20 flex-shrink-0">
              {initials(consultant.fullName)}
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white">{consultant.fullName}</h1>
              <p className="text-[#F4A261] mt-1">{consultant.specialization}</p>
              {consultant.factoryName && (
                <div className="flex items-center gap-2 mt-2 text-white/60">
                  <Building2 className="w-4 h-4" />
                  <Link to={consultant.factoryId ? `/factories/${consultant.factoryId}` : '#'} className="text-sm hover:text-white transition-colors">
                    {consultant.factoryName}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="h-1 bg-[#E63946]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8 flex-col lg:flex-row">
          {/* Left */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* About */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-[#0C1426] mb-3 section-divider">О консультанте</h2>
              <p className="text-[#4A5568] leading-relaxed">
                {consultant.experience || 'Опытный специалист по работе с китайскими заводами и поставщиками.'}
              </p>
              {consultant.specialization && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {consultant.specialization.split(',').map((s) => (
                    <span key={s} className="category-tag">{s.trim()}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements */}
            {achievements && achievements.length > 0 && (
              <div className="card p-6">
                <h2 className="font-display font-bold text-[#0C1426] mb-4 section-divider">Достижения</h2>
                <div className="space-y-3">
                  {achievements.map((a) => (
                    <div key={a.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 text-[#F4A261]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#4A5568]">{a.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-[#0C1426] mb-4 section-divider">Отзывы клиентов</h2>
              <div className="space-y-4">
                {MOCK_REVIEWS.map((r) => (
                  <div key={r.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F5F7FA] flex items-center justify-center text-xs font-bold text-[#0C1426] flex-shrink-0">
                      {r.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-[#0C1426]">{r.name}</span>
                        <div className="flex">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-[#F4A261] fill-[#F4A261]" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[#4A5568]">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sticky card */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="card p-5 sticky top-6">
              {/* Avatar + status */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#E8ECF0]">
                <div className="w-12 h-12 rounded-full bg-[#0C1426] flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {initials(consultant.fullName)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#0C1426]">{consultant.fullName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 bg-teal-500 rounded-full" />
                    <span className="text-xs text-teal-600">Онлайн</span>
                  </div>
                </div>
              </div>

              {!user ? (
                <div className="space-y-2">
                  <p className="text-xs text-[#718096] text-center mb-3">Войдите, чтобы связаться</p>
                  <Link to="/login" className="btn-primary w-full text-center block">Войти</Link>
                  <Link to="/register" className="btn-outline w-full text-center block">Зарегистрироваться</Link>
                </div>
              ) : user.role === 'CLIENT' ? (
                <div className="space-y-2">
                  <Link
                    to={`/requests/new?consultantId=${consultant.id}`}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Создать заявку
                  </Link>

                  {hasActiveRequest ? (
                    <div className="mt-4 space-y-2 pt-4 border-t border-[#E8ECF0]">
                      <p className="text-xs font-semibold text-[#718096] mb-2">Контакты консультанта</p>
                      {contactLinks?.map((link) => (
                        <a
                          key={link.id}
                          href={link.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-[#E63946] hover:underline"
                        >
                          <span className="font-medium">{link.serviceName}:</span>
                          <span>{link.link}</span>
                        </a>
                      ))}
                      {(!contactLinks || contactLinks.length === 0) && (
                        <p className="text-xs text-[#718096]">Контакты не указаны</p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-[#F5F7FA] border border-[#E8ECF0]">
                      <Lock className="w-4 h-4 text-[#718096] flex-shrink-0" />
                      <p className="text-xs text-[#718096]">Создайте заявку, чтобы получить контакты</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#718096] text-center py-2">Только чтение — чужой профиль</p>
              )}

              {/* Decorative watermark */}
              <div className="mt-5 pt-4 border-t border-[#E8ECF0] text-center">
                <span className="text-2xl text-[#E8ECF0] select-none" title="Честность · Сотрудничество">诚信</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
