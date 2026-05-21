import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Building2, SlidersHorizontal } from 'lucide-react'
import { factoryApi } from '@/entities/factory/api'
import { categoryApi } from '@/entities/productCategory/api'
import { FactoryCard } from '@/shared/ui/FactoryCard'
import { SearchBar } from '@/shared/ui/SearchBar'
import { PageHeader } from '@/shared/ui/PageHeader'

const container = { animate: { transition: { staggerChildren: 0.06 } } }
const item = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

export default function Factories() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  const { data: factories, isLoading } = useQuery({
    queryKey: ['factories', page, selectedCategory, search],
    queryFn: () =>
      search
        ? factoryApi.search(search).then((list) => ({
            content: list,
            totalElements: list.length,
            totalPages: 1,
            number: 0,
          }))
        : factoryApi.getAll({ page, size: 12, categoryId: selectedCategory ?? undefined }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
  })

  const handleCategoryToggle = (id: string) => {
    setSelectedCategory((prev) => (prev === id ? null : id))
    setPage(0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <PageHeader
        title="Каталог заводов"
        subtitle="Производители из Китая по всем категориям товаров"
      />

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="w-60 flex-shrink-0 hidden md:block">
          <div className="card p-4 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="w-4 h-4 text-[#E63946]" />
              <span className="font-semibold text-sm text-[#0C1426]">Фильтры</span>
            </div>

            <SearchBar
              value={search}
              onChange={(v) => { setSearch(v); setPage(0) }}
              placeholder="Поиск по названию"
              className="mb-4"
            />

            <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-2">
              Категории
            </p>
            <div className="space-y-1">
              {categories?.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-[#F5F7FA] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategory === cat.id}
                    onChange={() => handleCategoryToggle(cat.id)}
                    className="accent-[#E63946] w-3.5 h-3.5"
                  />
                  <span className="text-sm text-[#4A5568]">{cat.name}</span>
                </label>
              ))}
            </div>

            {(selectedCategory || search) && (
              <button
                onClick={() => { setSelectedCategory(null); setSearch(''); setPage(0) }}
                className="mt-4 w-full text-xs text-[#E63946] hover:underline"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[#718096]">
              Найдено <span className="font-semibold text-[#0C1426]">{factories?.totalElements ?? 0}</span> заводов
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="h-44 bg-[#E8ECF0]" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-[#E8ECF0] rounded w-3/4" />
                    <div className="h-3 bg-[#E8ECF0] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !factories?.content.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Building2 className="w-12 h-12 text-[#E8ECF0] mb-3" />
              <p className="font-semibold text-[#0C1426]">Заводы не найдены</p>
              <p className="text-sm text-[#718096] mt-1">Попробуйте изменить фильтры</p>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {factories.content.map((factory) => (
                <motion.div key={factory.id} variants={item}>
                  <FactoryCard factory={factory} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {factories && factories.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: factories.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    i === page
                      ? 'bg-[#E63946] text-white'
                      : 'bg-white border border-[#E8ECF0] text-[#4A5568] hover:border-[#E63946] hover:text-[#E63946]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
