import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/entities/user/api'
import { useAuthStore } from '@/features/auth/authStore'
import { Layout } from '@/widgets/Layout'
import { useAuth } from '@/shared/hooks/useAuth'
import toast from 'react-hot-toast'

const schema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})

type Form = z.infer<typeof schema>

export default function ClientProfile() {
  const { user } = useAuth()
  const setUser = useAuthStore((s) => s.setUser)
  const qc = useQueryClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      phone: user?.phone ?? '',
      email: user?.email ?? '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Form) => userApi.updateProfile(data),
    onSuccess: (updated) => {
      setUser(updated)
      qc.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile updated')
    },
    onError: () => toast.error('Failed to update profile'),
  })

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <Layout title="Profile">
      <div className="max-w-lg">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-text-main">{user?.fullName}</p>
              <p className="text-sm text-muted capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit((v) => updateMutation.mutate(v))} className="space-y-4">
            <div>
              <label className="form-label">Full name</label>
              <input {...register('fullName')} className="input-field" />
              {errors.fullName && <p className="text-xs text-danger mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="form-label">Phone</label>
              <input {...register('phone')} className="input-field" />
              {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="form-label">Email (optional)</label>
              <input {...register('email')} type="email" className="input-field" placeholder="you@example.com" />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || updateMutation.isPending}
              className="btn-primary w-full"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
