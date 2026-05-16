import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/shared/api/axios'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Eye, EyeOff, Lock, Phone, User } from 'lucide-react'
import axios from 'axios'
import { isNormalizedPhone, normalizePhone, sanitizePhoneInput } from '@/shared/lib/phone'

const schema = z.object({
  fullName: z.string().min(2, 'Min 2 characters'),
  phone: z
    .string()
    .min(1, 'Phone required')
    .transform(normalizePhone)
    .refine(isNormalizedPhone, 'Enter a valid 11-digit phone number'),
  password: z
    .string()
    .min(6)
    .max(20)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%.*?&])/, 'Password too weak'),
})

type Form = z.infer<typeof schema>

function getStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0
  if (pwd.length >= 6) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[@$!%.*?&]/.test(pwd)) score++

  if (score <= 2) return { score, label: 'Weak', color: '#EF4444' }
  if (score <= 3) return { score, label: 'Fair', color: '#F59E0B' }
  return { score, label: 'Strong', color: '#10B981' }
}

const FEATURES = [
  'Senior experts matched to your brief',
  'Clear deliverables, fast turnaround',
  'Trusted by growing businesses',
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

        {/* Main content */}
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

export default function Register() {
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = useState(false)
  const [role, setRole] = useState<'CLIENT' | 'CONSULTANT'>('CLIENT')

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      phone: '',
      password: '',
    },
  })

  const pwd = watch('password', '')
  const strength = pwd ? getStrength(pwd) : null

  async function onSubmit(values: Form) {
    try {
      await api.post('/auth/register', { ...values, role })
      toast.success('Account created! Sign in now.')
      navigate('/login')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data
        if (data?.validationErrors) {
          toast.error(Object.values(data.validationErrors as Record<string, string>).join('. '))
        } else if (data?.message) {
          toast.error(data.message)
        } else if (err.response?.status === 409) {
          toast.error('Phone number already registered.')
        } else {
          toast.error('Registration failed. Please check your details.')
        }
      } else {
        toast.error('Registration failed.')
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <LeftPanel />

      <div className="flex-1 flex flex-col">
        <div className="flex justify-end items-center px-10 py-5 gap-1.5">
          <span className="text-sm text-gray-500">Already have an account?</span>
          <Link to="/login" className="text-sm font-semibold text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-10 py-6">
          <div className="w-full max-w-[420px]">
            <h1 className="text-[2.2rem] font-black text-gray-900 mb-1">Create account.</h1>
            <p className="text-gray-400 text-sm mb-8">Get matched in under 24 hours.</p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset disabled={isSubmitting} className="border-0 p-0 m-0 space-y-4">

                {/* Full name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all bg-white">
                    <div className="pl-3">
                      <User size={14} className="text-gray-400" />
                    </div>
                    <input
                      {...register('fullName')}
                      placeholder="Your full name"
                      className="flex-1 px-3 py-3 text-sm outline-none bg-transparent placeholder-gray-400"
                      autoComplete="name"
                    />
                  </div>
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
                </div>

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
                            placeholder="+70009876543"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all bg-white">
                    <div className="pl-3">
                      <Lock size={14} className="text-gray-400" />
                    </div>
                    <input
                      {...register('password')}
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Create a password"
                      className="flex-1 px-3 py-3 text-sm outline-none bg-transparent placeholder-gray-400"
                      autoComplete="new-password"
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

                  {strength && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex-1 h-1 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor:
                                (i === 1 && strength.score >= 2) ||
                                (i === 2 && strength.score >= 3) ||
                                (i === 3 && strength.score >= 5)
                                  ? strength.color
                                  : '#E5E7EB',
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] font-medium" style={{ color: strength.color }}>
                        {strength.label} — use 6–20 chars, A–Z, a–z, 0–9, and @ $ ! % . * ? &
                      </p>
                    </div>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">I'm joining as</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['CLIENT', 'CONSULTANT'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`relative rounded-xl p-3.5 text-left transition-all border-2 ${
                          role === r
                            ? 'border-gray-900 bg-gray-900/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {role === r && (
                          <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center">
                            <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                        <p className="font-semibold text-sm text-gray-900">{r === 'CLIENT' ? 'Client' : 'Consultant'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{r === 'CLIENT' ? 'Submit briefs' : 'Take engagements'}</p>
                      </button>
                    ))}
                  </div>
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
                      Creating account...
                    </>
                  ) : 'Create account →'}
                </button>

              </fieldset>
            </form>

          </div>
        </div>
      </div>
    </div>
  )
}
