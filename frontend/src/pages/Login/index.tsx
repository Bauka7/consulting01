import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/shared/api/axios'
import { useAuthStore } from '@/features/auth/authStore'
import type { UserDto } from '@/entities/user/types'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Eye, EyeOff, Lock, Phone } from 'lucide-react'
import axios from 'axios'
import { isNormalizedPhone, normalizePhone, sanitizePhoneInput } from '@/shared/lib/phone'

const schema = z.object({
  phone: z
    .string()
    .min(1, 'Phone is required')
    .transform(normalizePhone)
    .refine(isNormalizedPhone, 'Enter a valid 11-digit phone number'),
  password: z.string().min(1, 'Password is required'),
})

type Form = z.infer<typeof schema>

const FEATURES = [
  'Senior experts matched to your brief',
  'Clear deliverables, fast turnaround',
  'Verified consultants, vetted outcomes',
]

function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col w-[44%] bg-[#0B1120] text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }}
      />
      <div className="relative flex flex-col h-full px-16 py-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="6" width="6" height="20" rx="1" fill="white" />
            <rect x="22" y="6" width="6" height="20" rx="1" fill="white" />
            <path d="M10 6 L22 26" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
            <rect x="10" y="4" width="12" height="4" rx="1" fill="#F59E0B" />
          </svg>
          <div>
            <div className="font-bold text-base leading-none tracking-tight">NextGen.</div>
            <div className="text-white/40 text-[9px] tracking-[0.28em] leading-none mt-1">CONSULTING</div>
          </div>
        </div>

        {/* Main content — vertically centered */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-[#F59E0B] text-[10px] font-semibold uppercase tracking-[0.26em] mb-8">
            Consulting Platform
          </p>
          <h2 className="text-[3rem] font-black leading-[1.06] mb-6">
            Expert advice.<br />
            <span className="text-[#F59E0B]">Real results.</span>
          </h2>
          <p className="text-white/45 text-[0.9rem] leading-relaxed mb-12 max-w-[300px]">
            Submit a brief, get matched with the right expert, and ship the answer.
          </p>

          <div className="space-y-5">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-full bg-[#F59E0B] flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="10" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#0B1120" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-white/70 text-[0.9rem]">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom status */}
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          <span className="text-white/30 text-xs tracking-wide">Platform online</span>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { setAccessToken, setUser } = useAuthStore()
  const [showPwd, setShowPwd] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: '',
      password: '',
    },
  })

  async function onSubmit(values: Form) {
    try {
      const { data } = await api.post<{ accessToken: string; refreshToken: string }>('/auth/login', values)
      setAccessToken(data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)

      const profile = await api.get<UserDto>('/users/profile', {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      })
      setUser(profile.data)

      const role = profile.data.role
      if (role === 'ADMIN') navigate('/admin/dashboard')
      else if (role === 'CONSULTANT') navigate('/consultant/dashboard')
      else navigate('/dashboard')

      toast.success('Welcome back!')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const d = err.response?.data
        if (d?.validationErrors) {
          toast.error(Object.values(d.validationErrors as Record<string, string>).join('. '))
        } else if (d?.message) {
          toast.error(d.message)
        } else {
          toast.error('Invalid phone or password.')
        }
      } else {
        toast.error('Sign in failed.')
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <LeftPanel />

      <div className="flex-1 flex flex-col">
        {/* Top nav */}
        <div className="flex justify-end items-center px-10 py-5 gap-1.5">
          <span className="text-sm text-gray-500">New here?</span>
          <Link to="/register" className="text-sm font-semibold text-blue-600 hover:underline">
            Create an account
          </Link>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-10">
          <div className="w-full max-w-[420px]">
            <h1 className="text-[2.2rem] font-black text-gray-900 mb-1">Sign in.</h1>
            <p className="text-gray-400 text-sm mb-8">Welcome back to your workspace.</p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset disabled={isSubmitting} className="border-0 p-0 m-0 space-y-4">

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all bg-white">
                    <div className="flex items-center flex-1 px-3">
                      <Phone size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <input
                            ref={field.ref}
                            name={field.name}
                            value={field.value ?? ''}
                            onBlur={field.onBlur}
                            onChange={(event) => field.onChange(sanitizePhoneInput(event.target.value))}
                            placeholder="+77009876543"
                            className="flex-1 py-3 text-sm outline-none bg-transparent placeholder-gray-400"
                            autoComplete="tel-national"
                            inputMode="tel"
                            maxLength={12}
                          />
                        )}
                      />
                    </div>
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <div className="mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                  </div>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all bg-white">
                    <div className="pl-3">
                      <Lock size={14} className="text-gray-400" />
                    </div>
                    <input
                      {...register('password')}
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="flex-1 px-3 py-3 text-sm outline-none bg-transparent placeholder-gray-400"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : 'Sign in →'}
                </button>

              </fieldset>
            </form>

          </div>
        </div>
      </div>
    </div>
  )
}
