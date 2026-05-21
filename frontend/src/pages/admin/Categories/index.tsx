import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Tag } from 'lucide-react'
import { categoryApi } from '@/entities/productCategory/api'
import { PageHeader } from '@/shared/ui/PageHeader'
import type { ProductCategoryDto } from '@/entities/productCategory/types'
import toast from 'react-hot-toast'

function CategoryModal({
  category,
  onClose,
}: {
  category?: ProductCategoryDto | null
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: category?.name ?? '',
    description: category?.description ?? '',
    iconUrl: category?.iconUrl ?? '',
  })

  const create = useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Категория создана'); onClose() },
    onError: () => toast.error('Категория с таким названием уже существует'),
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) => categoryApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Категория обновлена'); onClose() },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (category) update.mutate({ id: category.id, data: form })
    else create.mutate(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card w-full max-w-md"
      >
        <div className="p-6 border-b border-[#E8ECF0]">
          <h2 className="font-display font-bold text-[#0C1426]">
            {category ? 'Редактировать категорию' : 'Добавить категорию'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">Название *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input-field"
              placeholder="Электроника"
            />
          </div>
          <div>
            <label className="form-label">Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input-field"
              rows={2}
              placeholder="Описание категории..."
            />
          </div>
          <div>
            <label className="form-label">URL иконки</label>
            <input
              value={form.iconUrl}
              onChange={(e) => setForm((f) => ({ ...f, iconUrl: e.target.value }))}
              className="input-field"
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Отмена
            </button>
            <button
              type="submit"
              disabled={create.isPending || update.isPending}
              className="btn-primary flex-1"
            >
              {category ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const CATEGORY_EMOJIS: Record<string, string> = {
  мебель: '🪑',
  электроника: '⚡',
  посуда: '🍽️',
  стройматериалы: '🧱',
  одежда: '👕',
  аксессуары: '💎',
  промышленность: '🔩',
}

function getCategoryEmoji(name: string) {
  const key = name.toLowerCase()
  for (const [k, v] of Object.entries(CATEGORY_EMOJIS)) {
    if (key.includes(k)) return v
  }
  return '📦'
}

export default function AdminCategories() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; category?: ProductCategoryDto | null }>({ open: false })

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
  })

  const remove = useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Категория удалена') },
  })

  const handleDelete = (id: string) => {
    if (confirm('Удалить категорию?')) remove.mutate(id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <PageHeader
        title="Категории товаров"
        subtitle={`Всего: ${categories?.length ?? 0}`}
        action={
          <button onClick={() => setModal({ open: true })} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Добавить категорию
          </button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="w-10 h-10 bg-[#E8ECF0] rounded-xl mb-3" />
              <div className="h-4 bg-[#E8ECF0] rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : !categories?.length ? (
        <div className="flex flex-col items-center py-20 text-center card">
          <Tag className="w-10 h-10 text-[#E8ECF0] mb-3" />
          <p className="text-[#718096]">Категории не добавлены</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-4 group hover:border-[#CBD5E0] transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{getCategoryEmoji(cat.name)}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setModal({ open: true, category: cat })}
                    className="p-1.5 text-[#718096] hover:text-[#0C1426] hover:bg-[#F5F7FA] rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-[#718096] hover:text-[#E63946] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="font-semibold text-sm text-[#0C1426]">{cat.name}</p>
              {cat.description && (
                <p className="text-xs text-[#718096] mt-0.5 line-clamp-2">{cat.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {modal.open && (
        <CategoryModal category={modal.category} onClose={() => setModal({ open: false })} />
      )}
    </motion.div>
  )
}
