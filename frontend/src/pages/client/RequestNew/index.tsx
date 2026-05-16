import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { requestApi } from '@/entities/request/api'
import { consultantApi } from '@/entities/consultant/api'
import { Layout } from '@/widgets/Layout'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import toast from 'react-hot-toast'

const schema = z.object({
  fullName: z.string().min(2, 'Name required'),
  phone: z.string().min(1, 'Phone required'),
  product: z.string().min(2, 'Product/topic required'),
  description: z.string().min(10, 'Description min 10 chars'),
  consultantId: z.string().optional(),
})

type Form = z.infer<typeof schema>

export default function RequestNew() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      phone: user?.phone ?? '',
    },
  })

  const descriptionValue = watch('description', '')

  const { data: consultantsPage } = useQuery({
    queryKey: ['consultants-list'],
    queryFn: () => consultantApi.getAll({ page: 0, size: 50 }),
  })

  const createMutation = useMutation({
    mutationFn: (data: Form) =>
      requestApi.create({
        ...data,
        consultantId: data.consultantId || undefined,
      }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['my-requests'] })
      toast.success('Request created!')
      navigate(`/requests/${r.id}`)
    },
    onError: () => toast.error('Failed to create request'),
  })

  return (
    <Layout title="New Request">
      <div className="max-w-xl">
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold text-text-main mb-5">Submit a brief</h2>

          <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
            <fieldset disabled={createMutation.isPending} className="space-y-4 border-0 p-0 m-0">
            <div>
              <label className="form-label">Full name</label>
              <input {...register('fullName')} className="input-field" />
              {errors.fullName && <p className="text-xs text-danger mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="form-label">Phone</label>
              <input {...register('phone')} className="input-field" placeholder="+7 777 000 00 00" />
              {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="form-label">Topic / Product</label>
              <input {...register('product')} className="input-field" placeholder="e.g. Pricing strategy for B2B SaaS" />
              {errors.product && <p className="text-xs text-danger mt-1">{errors.product.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0">Description</label>
                <span className={`text-xs ${(descriptionValue?.length ?? 0) < 10 ? 'text-danger' : 'text-muted'}`}>
                  {descriptionValue?.length ?? 0} / min 10
                </span>
              </div>
              <textarea
                {...register('description')}
                rows={4}
                className="input-field resize-none"
                placeholder="Context, the question, and the expected deliverable..."
              />
              {errors.description && <p className="text-xs text-danger mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="form-label">Preferred consultant (optional)</label>
              <select {...register('consultantId')} className="input-field">
                <option value="">Auto-match</option>
                {consultantsPage?.content.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}{c.specialization ? ` · ${c.specialization}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/requests')}
                disabled={createMutation.isPending}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                ) : 'Submit request'}
              </button>
            </div>
            </fieldset>
          </form>
        </div>
      </div>
    </Layout>
  )
}
