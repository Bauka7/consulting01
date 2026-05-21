import type { ProductCategoryDto } from '@/entities/productCategory/types'

interface Props {
  category: ProductCategoryDto
  count?: number
  active?: boolean
  onClick?: () => void
  emoji?: string
  color?: string
}

const defaultColors = [
  'from-amber-50 to-amber-100 border-amber-200',
  'from-blue-50 to-blue-100 border-blue-200',
  'from-teal-50 to-teal-100 border-teal-200',
  'from-stone-50 to-stone-100 border-stone-200',
  'from-rose-50 to-rose-100 border-rose-200',
  'from-purple-50 to-purple-100 border-purple-200',
  'from-gray-50 to-gray-100 border-gray-200',
  'from-slate-50 to-slate-100 border-slate-200',
]

function hashString(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function CategoryCard({ category, count, active, onClick, emoji, color }: Props) {
  const colorClass = color ?? defaultColors[hashString(category.id) % defaultColors.length]

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 bg-gradient-to-br transition-all ${colorClass} ${
        active
          ? 'border-[#E63946] ring-2 ring-[#E63946]/20 shadow-md -translate-y-0.5'
          : 'hover:shadow-md hover:-translate-y-0.5 hover:border-opacity-80'
      }`}
    >
      <div className="text-3xl mb-2">{emoji ?? '📦'}</div>
      <div className="font-semibold text-[#0C1426] text-sm">{category.name}</div>
      {count !== undefined && (
        <div className="text-xs text-[#718096] mt-0.5">{count} консультанта</div>
      )}
    </button>
  )
}
