import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center max-w-sm">
        <h1 className="text-7xl font-black text-gray-200 mb-4">404</h1>
        <p className="font-semibold text-text-main mb-1">Page not found</p>
        <p className="text-muted text-sm mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary inline-block">Go home</Link>
      </div>
    </div>
  )
}
