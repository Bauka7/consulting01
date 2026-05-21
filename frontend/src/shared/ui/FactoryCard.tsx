import { Building2, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { FactoryDto } from '@/entities/factory/types'

interface Props {
  factory: FactoryDto
}

export function FactoryCard({ factory }: Props) {
  return (
    <Link to={`/factories/${factory.id}`} className="block card-hover overflow-hidden group">
      <div className="relative h-44 bg-gradient-to-br from-[#0C1426] to-[#1A2540] overflow-hidden">
        {factory.imageUrl ? (
          <img
            src={factory.imageUrl}
            alt={factory.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-16 h-16 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {factory.location && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white/80 text-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span>{factory.location}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-[#0C1426] mb-2 truncate">{factory.name}</h3>

        {factory.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {factory.categories.slice(0, 2).map((cat) => (
              <span key={cat.id} className="category-tag">
                {cat.name}
              </span>
            ))}
            {factory.categories.length > 2 && (
              <span className="category-tag">+{factory.categories.length - 2}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#E8ECF0]">
          <div className="flex items-center gap-1.5 text-[#718096] text-xs">
            <Users className="w-3.5 h-3.5" />
            <span>Консультанты</span>
          </div>
          <span className="text-[#E63946] text-xs font-semibold">Подробнее →</span>
        </div>
      </div>
    </Link>
  )
}
