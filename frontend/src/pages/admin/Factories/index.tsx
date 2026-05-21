import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Building2, Search } from 'lucide-react'
import { factoryApi } from '@/entities/factory/api'
import { categoryApi } from '@/entities/productCategory/api'
import { PageHeader } from '@/shared/ui/PageHeader'
import type { FactoryDto, CreateFactoryDto } from '@/entities/factory/types'
import toast from 'react-hot-toast'

function FactoryModal({
  factory,
  onClose,
}: {
  factory?: FactoryDto | null
  onClose: () => void
}) {
  const qc = useQueryClient()
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoryApi.getAll })
  const [form, setForm] = useState<CreateFactoryDto>({
    name: factory?.name ?? '',
    description: factory?.description ?? '',
    location: factory?.location ?? '',
    imageUrl: factory?.imageUrl ?? '',
    categoryIds: factory?.categories.map((c) => c.id) ?? [],
  })

  const create = useMutation({
    mutationFn: factoryApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['factories'] }); toast.success('Завод создан'); onClose() },
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateFactoryDto }) => factoryApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['factories'] }); toast.success('Завод обновлён'); onClose() },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (factory) update.mutate({ id: factory.id, data: form })
    else create.mutate(form)
  }

  const toggleCat = (id: string) => {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds?.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : [...(f.categoryIds ?? []), id],
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-[#E8ECF0]">
          <h2 className="font-display font-bold text-[#0C1426]">
            {factory ? 'Редактировать завод' : 'Добавить завод'}
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
              placeholder="Guangzhou Tech Factory"
            />
          </div>
          <div>
            <label className="form-label">Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input-field"
              rows={3}
              placeholder="Описание завода..."
            />
          </div>
          <div>
            <label className="form-label">Местоположение</label>
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="input-field"
              placeholder="Гуанчжоу, Китай"
            />
          </div>
          <div>
            <label className="form-label">URL изображения</label>
            <input
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              className="input-field"
              placeholder="https://..."
            />
          </div>
          {categories && (
            <div>
              <label className="form-label">Категории</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCat(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      form.categoryIds?.includes(cat.id)
                        ? 'bg-[#E63946] text-white'
                        : 'bg-[#F5F7FA] text-[#4A5568] hover:bg-[#FEE2E2] hover:text-[#E63946]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Отмена
            </button>
            <button
              type="submit"
              disabled={create.isPending || update.isPending}
              className="btn-primary flex-1"
            >
              {factory ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function AdminFactories() {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ open: boolean; factory?: FactoryDto | null }>({ open: false })

  const { data: factories, isLoading } = useQuery({
    queryKey: ['factories', page, search],
    queryFn: () =>
      search
        ? factoryApi.search(search).then((list) => ({ content: list, totalElements: list.length, totalPages: 1, number: 0 }))
        : factoryApi.getAll({ page, size: 15 }),
  })

  const remove = useMutation({
    mutationFn: factoryApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['factories'] }); toast.success('Завод удалён') },
    onError: () => toast.error('Нельзя удалить завод с активными заявками'),
  })

  const handleDelete = (id: string) => {
    if (confirm('Удалить завод?')) remove.mutate(id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-4 py-8"
    >
      <PageHeader
        title="Заводы"
        subtitle={`Всего: ${factories?.totalElements ?? 0}`}
        action={
          <button onClick={() => setModal({ open: true })} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Добавить завод
          </button>
        }
      />

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[#E8ECF0]">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              placeholder="Поиск по названию..."
              className="input-field pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-[#718096]">Загрузка...</div>
        ) : !factories?.content.length ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Building2 className="w-10 h-10 text-[#E8ECF0] mb-3" />
            <p className="text-[#718096]">Заводы не найдены</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5F7FA] border-b border-[#E8ECF0]">
                  <th className="text-left px-4 py-3 font-semibold text-[#718096] w-12">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#718096]">Название</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#718096]">Местоположение</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#718096]">Категории</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#718096]">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF0]">
                {factories.content.map((f, idx) => (
                  <tr key={f.id} className="hover:bg-[#F5F7FA] transition-colors">
                    <td className="px-4 py-3 text-[#718096]">{page * 15 + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {f.imageUrl ? (
                          <img src={f.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-[#CBD5E0]" />
                          </div>
                        )}
                        <span className="font-semibold text-[#0C1426]">{f.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#4A5568]">{f.location ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {f.categories.slice(0, 2).map((c) => (
                          <span key={c.id} className="category-tag">{c.name}</span>
                        ))}
                        {f.categories.length > 2 && (
                          <span className="category-tag">+{f.categories.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModal({ open: true, factory: f })}
                          className="p-2 text-[#718096] hover:text-[#0C1426] hover:bg-[#F5F7FA] rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="p-2 text-[#718096] hover:text-[#E63946] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {factories && factories.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-[#E8ECF0]">
            {Array.from({ length: factories.totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  i === page ? 'bg-[#E63946] text-white' : 'border border-[#E8ECF0] text-[#4A5568] hover:border-[#E63946]'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {modal.open && (
        <FactoryModal factory={modal.factory} onClose={() => setModal({ open: false })} />
      )}
    </motion.div>
  )
}
