import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserCheck, Package, Calendar, Phone, ArrowRight, Lock, Minus, Plus } from 'lucide-react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { requestApi } from '@/entities/request/api'
import { consultantApi } from '@/entities/consultant/api'
import { useAuthStore } from '@/features/auth/authStore'
import toast from 'react-hot-toast'
import { addDays, differenceInWeeks, format } from 'date-fns'

const schema = z.object({
  consultantId: z.string().optional(),
  product: z.string().min(2, 'Введите название товара'),
  quantity: z.number().min(1, 'Минимум 1'),
  unit: z.string().min(1, 'Выберите единицу'),
  description: z.string().optional(),
  deadline: z.string().min(1, 'Выберите дату'),
  fullName: z.string().min(2, 'Введите имя'),
  phone: z.string().min(10, 'Введите телефон'),
})
type FormData = z.infer<typeof schema>

const UNITS = ['шт', 'кг', 'м²', 'м', 'тонн', 'контейнер']

export default function RequestNew() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const preConsultantId = searchParams.get('consultantId')
  const preFactoryId = searchParams.get('factoryId')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      consultantId: preConsultantId ?? '',
      quantity: 1,
      unit: 'шт',
      deadline: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
    },
  })

  const { data: consultants } = useQuery({
    queryKey: ['consultants-all'],
    queryFn: () => consultantApi.getAll({ size: 100 }),
  })

  const { data: selectedConsultant } = useQuery({
    queryKey: ['consultant', watch('consultantId')],
    queryFn: () => consultantApi.getById(watch('consultantId')!),
    enabled: !!watch('consultantId'),
  })

  const create = useMutation({
    mutationFn: (data: FormData) =>
      requestApi.create({
        consultantId: data.consultantId || undefined,
        product: `${data.product} × ${data.quantity} ${data.unit}`,
        description: data.description,
        fullName: data.fullName,
        phone: data.phone,
        factoryId: preFactoryId ?? undefined,
        deadline: data.deadline,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-requests'] })
      toast.success('Заявка отправлена!')
      navigate('/requests')
    },
    onError: () => toast.error('Ошибка при отправке заявки'),
  })

  const quantity = watch('quantity')
  const deadline = watch('deadline')
  const weeksUntil = deadline ? differenceInWeeks(new Date(deadline), new Date()) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
      className="max-w-2xl mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-[#0C1426]">Новая заявка</h1>
        <p className="text-[#718096] mt-1">Заполните форму — консультант свяжется с вами в течение 2 часов</p>
      </div>

      <form onSubmit={handleSubmit((data) => create.mutate(data))} className="space-y-4">
        {/* Section 1: Consultant */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-4 h-4 text-[#E63946]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#E63946] uppercase tracking-wider">01</span>
              <h2 className="font-semibold text-[#0C1426]">Консультант</h2>
            </div>
          </div>

          <div>
            <label className="form-label">Имя консультанта</label>
            <select {...register('consultantId')} className="input-field">
              <option value="">Выберите консультанта...</option>
              {consultants?.content.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}{c.factoryName ? ` — ${c.factoryName}` : ''}
                </option>
              ))}
            </select>
            {selectedConsultant && (
              <div className="mt-2 p-3 rounded-xl bg-[#F5F7FA] border border-[#E8ECF0] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0C1426] flex items-center justify-center text-white text-xs font-bold">
                  {selectedConsultant.fullName.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0C1426]">{selectedConsultant.fullName}</p>
                  <p className="text-xs text-[#718096]">{selectedConsultant.specialization}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Product */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-[#E63946]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#E63946] uppercase tracking-wider">02</span>
              <h2 className="font-semibold text-[#0C1426]">Товар</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label">Наименование товара *</label>
              <input
                {...register('product')}
                className="input-field"
                placeholder="Например: Офисные кресла модель X3"
              />
              {errors.product && <p className="text-xs text-[#E63946] mt-1">{errors.product.message}</p>}
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="form-label">Количество *</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setValue('quantity', Math.max(1, (quantity ?? 1) - 1))}
                    className="w-9 h-9 rounded-lg border border-[#E8ECF0] flex items-center justify-center hover:bg-[#F5F7FA] transition-colors flex-shrink-0"
                  >
                    <Minus className="w-4 h-4 text-[#718096]" />
                  </button>
                  <input
                    {...register('quantity', { valueAsNumber: true })}
                    type="number"
                    min={1}
                    className="input-field text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setValue('quantity', (quantity ?? 1) + 1)}
                    className="w-9 h-9 rounded-lg border border-[#E8ECF0] flex items-center justify-center hover:bg-[#F5F7FA] transition-colors flex-shrink-0"
                  >
                    <Plus className="w-4 h-4 text-[#718096]" />
                  </button>
                </div>
                {errors.quantity && <p className="text-xs text-[#E63946] mt-1">{errors.quantity.message}</p>}
              </div>

              <div className="w-36">
                <label className="form-label">Единица *</label>
                <select {...register('unit')} className="input-field">
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Описание / Требования</label>
              <textarea
                {...register('description')}
                className="input-field"
                rows={3}
                placeholder="Укажите цвет, размер, материал, стандарты качества..."
              />
            </div>
          </div>
        </div>

        {/* Section 3: Deadline */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-[#E63946]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#E63946] uppercase tracking-wider">03</span>
              <h2 className="font-semibold text-[#0C1426]">Сроки</h2>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="form-label">Желаемая дата получения *</label>
              <input
                {...register('deadline')}
                type="date"
                min={format(addDays(new Date(), 7), 'yyyy-MM-dd')}
                className="input-field"
              />
              {errors.deadline && <p className="text-xs text-[#E63946] mt-1">{errors.deadline.message}</p>}
            </div>
            {deadline && weeksUntil > 0 && (
              <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E8ECF0]">
                <p className="text-sm text-[#718096]">
                  Ориентировочная поставка: <span className="font-semibold text-[#0C1426]">{weeksUntil}-{weeksUntil + 2} недель</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Contact */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-[#E63946]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#E63946] uppercase tracking-wider">04</span>
              <h2 className="font-semibold text-[#0C1426]">Контакт</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label">Ваше имя *</label>
              <input
                {...register('fullName')}
                className="input-field"
                defaultValue={user?.fullName}
                placeholder="Иван Иванов"
              />
              {errors.fullName && <p className="text-xs text-[#E63946] mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="form-label">Телефон *</label>
              <input
                {...register('phone')}
                className="input-field"
                placeholder="+7 000 000 00 00"
              />
              {errors.phone && <p className="text-xs text-[#E63946] mt-1">{errors.phone.message}</p>}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={create.isPending}
          className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
        >
          {create.isPending ? 'Отправка...' : (
            <>
              Отправить заявку консультанту
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-[#718096]">
          <Lock className="w-3.5 h-3.5" />
          Ваши данные в безопасности
        </div>
      </form>
    </motion.div>
  )
}
