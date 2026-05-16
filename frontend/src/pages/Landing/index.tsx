import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { consultantApi } from '@/entities/consultant/api'
import { ArrowRight, ChevronRight } from 'lucide-react'
import type { ConsultantDto } from '@/entities/consultant/types'
import { useAuth } from '@/shared/hooks/useAuth'

function ConsultantCard({ consultant }: { consultant: ConsultantDto }) {
  const initials = consultant.fullName
    ? consultant.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const colors = ['bg-blue-500', 'bg-gray-800', 'bg-amber-500', 'bg-gray-700', 'bg-purple-500', 'bg-teal-500']
  const colorIndex = consultant.id.charCodeAt(0) % colors.length

  return (
    <Link to={`/consultants/${consultant.id}`} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow block">
      <div className={`w-10 h-10 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white text-sm font-bold mb-3`}>
        {initials}
      </div>
      <h3 className="font-semibold text-gray-900 text-sm">{consultant.fullName ?? 'Consultant'}</h3>
      <p className="text-gray-500 text-xs mt-0.5">{consultant.specialization}</p>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Experience</p>
          <p className="text-sm font-semibold text-gray-900">{consultant.experience}</p>
        </div>
        <ChevronRight size={16} className="text-gray-400" />
      </div>
    </Link>
  )
}

export default function Landing() {
  const { isAuthenticated, user } = useAuth()

  const { data: consultantsPage } = useQuery({
    queryKey: ['consultants-landing'],
    queryFn: () => consultantApi.getAll({ page: 0, size: 6 }),
  })

  const consultants = consultantsPage?.content ?? []

  const dashboardPath =
    user?.role === 'ADMIN'
      ? '/admin/dashboard'
      : user?.role === 'CONSULTANT'
      ? '/consultant/dashboard'
      : '/dashboard'

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="6" width="6" height="20" rx="1" fill="#0F172A" />
              <rect x="22" y="6" width="6" height="20" rx="1" fill="#0F172A" />
              <path d="M10 6 L22 26" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
              <rect x="10" y="4" width="12" height="4" rx="1" fill="#F59E0B" />
            </svg>
            <span className="font-bold text-gray-900">NextGen.</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link to="/consultants" className="hover:text-gray-900 transition-colors">Consultants</Link>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to={dashboardPath} className="btn-primary flex items-center gap-1.5">
              Dashboard <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Sign in</Link>
              <Link to="/register" className="btn-primary flex items-center gap-1.5 text-sm">
                Get Consultation <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-24 max-w-3xl mx-auto">
        <h1 className="text-6xl font-black text-gray-900 leading-tight mb-6">
          Expert Advice.<br />
          <span className="text-accent italic">Real Results</span>.
        </h1>
        <p className="text-gray-500 text-lg mb-10">
          Senior consultants, on demand. Submit a brief, get matched,<br />ship the answer.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
            Get Consultation <ArrowRight size={16} />
          </Link>
          <Link to="/consultants" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            Become a Consultant
          </Link>
        </div>
      </section>

      {/* Consultants */}
      <section className="px-8 py-16 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-1">Consultants</p>
            <h2 className="text-3xl font-black text-gray-900">Senior operators.</h2>
          </div>
          <Link to="/consultants" className="text-sm text-accent hover:underline flex items-center gap-1">
            Browse all <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {consultants.map((c) => (
            <ConsultantCard key={c.id} consultant={c} />
          ))}
          {consultants.length === 0 &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5 animate-pulse h-40" />
            ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-8 py-20 max-w-4xl mx-auto">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-medium text-center mb-2">How it works</p>
        <h2 className="text-4xl font-black text-gray-900 text-center mb-12">Three steps.</h2>
        <div className="grid grid-cols-3 gap-8">
          {[
            { n: '01', title: 'Submit a brief', desc: 'Context, the question, the deliverable. Four minutes.' },
            { n: '02', title: 'Get matched', desc: 'Pick from three consultants — domain fit, calendar, history.' },
            { n: '03', title: 'Ship the answer', desc: 'Memo, working session, or full deck. Paid on delivery.' },
          ].map((step) => (
            <div key={step.n} className="border border-gray-200 rounded-xl p-6">
              <p className="text-4xl font-black text-gray-200 mb-4">{step.n}</p>
              <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-6 mb-16 bg-gray-900 rounded-2xl px-12 py-16 text-center">
        <h2 className="text-4xl font-black text-white mb-8">
          Your hardest question,<br />
          answered <span className="text-gold">by Friday.</span>
        </h2>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="btn-accent flex items-center gap-2 text-sm px-6 py-3">
            Get Consultation <ArrowRight size={14} />
          </Link>
          <Link to="/consultants" className="border border-white/30 text-white px-6 py-3 rounded-lg text-sm hover:bg-white/10 transition-colors">
            Become a Consultant
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-6 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-1.5">
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="6" width="6" height="20" rx="1" fill="#94A3B8" />
            <rect x="22" y="6" width="6" height="20" rx="1" fill="#94A3B8" />
            <path d="M10 6 L22 26" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <span>NextGen</span>
        </div>
        <div className="flex gap-5">
          <a href="#" className="hover:text-gray-700">Security</a>
          <a href="#" className="hover:text-gray-700">Privacy</a>
          <a href="#" className="hover:text-gray-700">Terms</a>
        </div>
      </footer>
    </div>
  )
}
