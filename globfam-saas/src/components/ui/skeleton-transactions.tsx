import { Card, CardContent, CardHeader } from '@/components/shared-ui'
import { Skeleton } from './skeleton'

export function SkeletonTransactionList() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-28" />
            <div className="ml-auto">
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <SkeletonTransaction key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function SkeletonTransaction() {
  return (
    <div className="flex items-center justify-between border-b pb-3 last:border-0">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-5 w-20 ml-auto" />
        <Skeleton className="h-3 w-16 ml-auto" />
      </div>
    </div>
  )
}