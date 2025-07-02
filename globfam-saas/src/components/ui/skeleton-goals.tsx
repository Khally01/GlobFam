import { Card, CardContent, CardHeader } from '@/components/shared-ui'
import { Skeleton } from './skeleton'

export function SkeletonGoals() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Goals Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <SkeletonGoalCard key={i} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonGoalCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}