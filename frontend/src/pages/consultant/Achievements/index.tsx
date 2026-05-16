import { useQuery } from '@tanstack/react-query'
import { achievementApi } from '@/entities/achievement/api'
import { Layout } from '@/widgets/Layout'
import { EmptyState } from '@/shared/ui/EmptyState'
import { format } from 'date-fns'
import { parseDate } from '@/shared/lib/date'
import { Trophy } from 'lucide-react'

export default function ConsultantAchievements() {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['my-achievements'],
    queryFn: () => achievementApi.getMy(),
  })

  return (
    <Layout title="Achievements">
      <div className="max-w-lg">
        <div className="bg-card rounded-xl border border-border">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !achievements || achievements.length === 0 ? (
            <EmptyState title="No achievements yet" description="Achievements are awarded automatically when you complete requests." />
          ) : (
            <div className="divide-y divide-border">
              {achievements.map((a) => (
                <div key={a.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trophy size={18} className="text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-main">{a.description}</p>
                    <p className="text-xs text-muted">{format(parseDate(a.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
