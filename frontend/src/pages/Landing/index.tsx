import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Building2, Users, CheckCircle, Search,
  MessageSquare, Truck, Shield, ChevronDown
} from 'lucide-react'
import { categoryApi } from '@/entities/productCategory/api'
import { consultantApi } from '@/entities/consultant/api'
import { LogoFull } from '@/shared/ui/Logo'
import { useAuthStore } from '@/features/auth/authStore'

const CATEGORY_EMOJIS: Record<string, string> = {
  мебель: '🪑', электроника: '⚡', посуда: '🍽️',
  стройматериалы: '🧱', одежда: '👕', аксессуары: '💎',
  промышленность: '🔩',
}
function getCategoryEmoji(name: string) {
  const key = name.toLowerCase()
  for (const [k, v] of Object.entries(CATEGORY_EMOJIS)) {
    if (key.includes(k)) return v
  }
  return '📦'
}

const CATEGORY_COLORS = [
  'from-amber-50 to-amber-100 border-amber-200',
  'from-blue-50 to-blue-100 border-blue-200',
  'from-teal-50 to-teal-100 border-teal-200',
  'from-stone-50 to-stone-100 border-stone-200',
  'from-rose-50 to-rose-100 border-rose-200',
  'from-purple-50 to-purple-100 border-purple-200',
  'from-gray-50 to-gray-100 border-gray-200',
  'from-slate-50 to-slate-100 border-slate-200',
]

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

const container = { animate: { transition: { staggerChildren: 0.06 } } }
const cardItem = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

export default function Landing() {
  const { user } = useAuthStore()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
  })

  const { data: allConsultants } = useQuery({
    queryKey: ['consultants-all'],
    queryFn: () => consultantApi.getAll({ size: 100 }),
  })

  const selectedCategory = categories?.find((c) => c.id === selectedCategoryId)
  const filteredConsultants = allConsultants?.content.slice(0, 6) ?? []

  const scrollToCategories = () => {
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0C1426]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <LogoFull variant="light" size="md" />
          <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <a href="#categories" className="hover:text-white transition-colors">Категории</a>
            <Link to="/factories" className="hover:text-white transition-colors">Заводы</Link>
            <Link to="/consultants" className="hover:text-white transition-colors">Консультанты</Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={
                  user.role === 'CLIENT' ? '/dashboard'
                  : user.role === 'CONSULTANT' ? '/consultant/dashboard'
                  : '/admin/dashboard'
                }
                className="btn-primary text-sm py-2"
              >
                Личный кабинет
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors">Войти</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Регистрация</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-[#0C1426] to-[#1A2540] pt-16 overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E63946]/20 border border-[#E63946]/30 text-[#F87171] text-sm font-medium mb-6">
              🏭 Прямые поставки из Китая
            </div>
            <h1 className="font-display text-4xl md:text-5xl xl:text-6xl font-bold text-white leading-tight mb-5">
              Найдите товар.{' '}
              <span className="text-[#E63946]">Свяжитесь</span>{' '}
              через консультанта.
            </h1>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Более 100 заводов. Консультанты, которые знают рынок изнутри. Без лишних посредников — только прямые цены.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={scrollToCategories}
                className="btn-primary flex items-center gap-2 text-base px-6 py-3"
              >
                Выбрать категорию
                <ChevronDown className="w-4 h-4" />
              </button>
              <a
                href="#how"
                className="flex items-center gap-2 px-6 py-3 border border-white/30 text-white/80 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                Как это работает
              </a>
            </div>

            <div className="flex items-center gap-8 mt-10">
              {[
                { value: '100+', label: 'Заводов' },
                { value: '50+', label: 'Консультантов' },
                { value: '500+', label: 'Заявок выполнено' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-display text-2xl font-bold text-white">{value}</p>
                  <p className="text-white/50 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Animated mock card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-5 max-w-sm mx-auto">
                <div className="h-36 rounded-xl bg-gradient-to-br from-[#E63946]/30 to-[#0C1426] mb-4 flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-white/40" />
                </div>
                <h3 className="font-semibold text-white mb-1">Guangzhou Tech Factory</h3>
                <div className="flex gap-2 mb-3">
                  <span className="category-tag text-xs">Электроника</span>
                  <span className="category-tag text-xs">Техника</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-teal-400 text-xs">
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                    Консультант онлайн
                  </div>
                  <button className="btn-primary text-xs py-1.5 px-3">Связаться</button>
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-teal-500" />
                <span className="text-xs font-semibold text-[#0C1426]">Заявка принята!</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-[#0C1426] mb-2">
              Выберите категорию товаров
            </h2>
            <p className="text-[#718096]">Нажмите на категорию, чтобы увидеть консультантов</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories?.map((cat, idx) => {
              const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
              const isActive = cat.id === selectedCategoryId
              return (
                <motion.button
                  key={cat.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSelectedCategoryId(isActive ? null : cat.id)
                    setTimeout(() => {
                      document.getElementById('consultants')?.scrollIntoView({ behavior: 'smooth' })
                    }, 100)
                  }}
                  className={`p-4 rounded-2xl border-2 bg-gradient-to-br text-left transition-all ${color} ${
                    isActive ? 'border-[#E63946] ring-2 ring-[#E63946]/20 shadow-md' : ''
                  }`}
                >
                  <div className="text-3xl mb-2">{getCategoryEmoji(cat.name)}</div>
                  <p className="font-semibold text-[#0C1426] text-sm">{cat.name}</p>
                  <p className="text-xs text-[#718096] mt-0.5">{cat.description ?? 'Прямые поставки'}</p>
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Consultants */}
      <section id="consultants" className="py-16 px-4 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategoryId ?? 'all'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#0C1426]">
                    {selectedCategory ? `Консультанты: ${selectedCategory.name}` : 'Наши консультанты'}
                  </h2>
                  <p className="text-[#718096] text-sm mt-1">{filteredConsultants.length} специалистов</p>
                </div>
                {selectedCategoryId && (
                  <button onClick={() => setSelectedCategoryId(null)} className="text-sm text-[#E63946] hover:underline">
                    Показать всех
                  </button>
                )}
              </div>

              {filteredConsultants.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-12 h-12 text-[#E8ECF0] mx-auto mb-3" />
                  <p className="text-[#718096]">Нет консультантов</p>
                </div>
              ) : (
                <motion.div
                  variants={container}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {filteredConsultants.map((c) => (
                    <motion.div key={c.id} variants={cardItem}>
                      <div className="card p-5 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-[#0C1426] flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {initials(c.fullName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-[#0C1426] truncate">{c.fullName}</p>
                            <p className="text-xs text-[#718096] truncate">{c.specialization}</p>
                            {c.factoryName && (
                              <div className="flex items-center gap-1 mt-1">
                                <Building2 className="w-3 h-3 text-[#E63946] flex-shrink-0" />
                                <span className="text-xs text-[#E63946] truncate">{c.factoryName}</span>
                              </div>
                            )}
                          </div>
                          <span className="w-2 h-2 bg-teal-400 rounded-full flex-shrink-0 mt-2" />
                        </div>
                        <Link
                          to={`/requests/new?consultantId=${c.id}`}
                          className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Написать
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <div className="text-center mt-8">
                <Link to="/consultants" className="btn-outline inline-flex items-center gap-2">
                  Все консультанты
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-[#0C1426] mb-12">Как это работает</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, step: '01', title: 'Выберите категорию', desc: 'Найдите нужную категорию товаров и подходящего консультанта' },
              { icon: MessageSquare, step: '02', title: 'Напишите консультанту', desc: 'Оставьте заявку — консультант свяжется в течение 2 часов' },
              { icon: CheckCircle, step: '03', title: 'Получите поставку', desc: 'Консультант согласует цену с заводом и организует доставку' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#FEE2E2] flex items-center justify-center mb-4 relative">
                  <Icon className="w-7 h-7 text-[#E63946]" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#E63946] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="font-semibold text-[#0C1426] mb-2">{title}</h3>
                <p className="text-sm text-[#718096] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 px-4 bg-[#F5F7FA]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-[#0C1426] text-center mb-10">Почему SinoLink</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Building2, title: 'Прямые цены завода', desc: 'Без лишних посредников — цена напрямую от производителя' },
              { icon: Users, title: 'Персональный консультант', desc: 'Специалист, который знает рынок изнутри' },
              { icon: Truck, title: 'Логистика под ключ', desc: 'Доставка, таможня, документы — всё включено' },
              { icon: Shield, title: 'Гарантия качества', desc: 'Только проверенные заводы с подтверждёнными сертификатами' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-5">
                <div className="w-12 h-12 rounded-xl bg-[#FEE2E2] flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#E63946]" />
                </div>
                <h3 className="font-semibold text-[#0C1426] mb-1">{title}</h3>
                <p className="text-sm text-[#718096] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#0C1426] to-[#1A2540]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Готовы начать поиск товаров?
          </h2>
          <p className="text-white/60 mb-8">
            Зарегистрируйтесь и получите доступ к каталогу заводов и консультантам
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-primary px-8 py-3 text-base">Зарегистрироваться</Link>
            <Link to="/factories" className="flex items-center gap-2 px-8 py-3 border border-white/30 text-white/80 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors">
              Каталог заводов
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0C1426] border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <LogoFull variant="light" size="sm" />
          <nav className="flex gap-6 text-sm text-white/50">
            <a href="#categories" className="hover:text-white/80 transition-colors">Категории</a>
            <Link to="/consultants" className="hover:text-white/80 transition-colors">Консультанты</Link>
            <Link to="/factories" className="hover:text-white/80 transition-colors">Заводы</Link>
          </nav>
          <p className="text-xs text-white/30">© 2025 SinoLink</p>
        </div>
      </footer>
    </div>
  )
}
