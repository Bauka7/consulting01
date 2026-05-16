import { Link } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldOff size={28} className="text-danger" />
        </div>
        <h1 className="text-4xl font-black text-text-main mb-2">403</h1>
        <p className="font-semibold text-text-main mb-1">Access denied</p>
        <p className="text-muted text-sm mb-6">You don't have permission to view this page.</p>
        <Link to="/" className="btn-primary inline-block">Go home</Link>
      </div>
    </div>
  )
}
