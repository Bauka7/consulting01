import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { consultantApi } from '@/entities/consultant/api'
import { userApi } from '@/entities/user/api'
import { useAuthStore } from '@/features/auth/authStore'
import { Layout } from '@/widgets/Layout'
import { useAuth } from '@/shared/hooks/useAuth'
import toast from 'react-hot-toast'

const schema = z.object({
  specialization: z.string().min(2),
  experience: z.string().min(1),
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})

type Form = z.infer<typeof schema>

export default function ConsultantProfile() {
  const { user } = useAuth()
  const setUser = useAuthStore((s) => s.setUser)
  const qc = useQueryClient()

  const { data: consultant } = useQuery({
    queryKey: ['my-consultant', user?.id],
    queryFn: () => consultantApi.getByUserId(user!.id),
    enabled: !!user?.id,
  })

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    values: {
      specialization: consultant?.specialization ?? '',
      experience: consultant?.experience ?? '',
      fullName: user?.fullName ?? '',
      phone: user?.phone ?? '',
      email: user?.email ?? '',
    },
  })

  const updateConsultant = useMutation({
    mutationFn: (data: Form) =>
      consultantApi.updateMy({ specialization: data.specialization, experience: data.experience }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-consultant'] })
      toast.success('Consultant profile updated')
    },
    onError: () => toast.error('Failed to update'),
  })

  const updateUser = useMutation({
    mutationFn: (data: Form) =>
      userApi.updateProfile({ fullName: data.fullName, phone: data.phone, email: data.email || undefined }),
    onSuccess: (updated) => {
      setUser(updated)
      toast.success('Personal info updated')
    },
  })

  async function onSubmit(data: Form) {
    await Promise.all([updateConsultant.mutateAsync(data), updateUser.mutateAsync(data)])
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <Layout title="My Profile">
      <div className="max-w-lg space-y-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-text-main">{user?.fullName}</p>
              <p className="text-sm text-muted">Consultant</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="form-label">Full name</label>
              <input {...register('fullName')} className="input-field" />
            </div>

            <div>
              <label className="form-label">Phone</label>
              <input {...register('phone')} className="input-field" />
            </div>

            <div>
              <label className="form-label">Email</label>
              <input {...register('email')} type="email" className="input-field" />
            </div>

            <hr className="border-border" />

            <div>
              <label className="form-label">Specialization</label>
              <input {...register('specialization')} className="input-field" placeholder="e.g. Pricing & Monetization" />
              {errors.specialization && <p className="text-xs text-danger mt-1">{errors.specialization.message}</p>}
            </div>

            <div>
              <label className="form-label">Experience</label>
              <input {...register('experience')} className="input-field" placeholder="e.g. 12 years" />
              {errors.experience && <p className="text-xs text-danger mt-1">{errors.experience.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || updateConsultant.isPending || updateUser.isPending}
              className="btn-primary w-full"
            >
              {updateConsultant.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
