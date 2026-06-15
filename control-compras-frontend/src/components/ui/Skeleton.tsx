interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div className={`skeleton-shimmer ${className}`} />
);

export const SkeletonText = ({ lines = 3, className = '' }: { lines?: number; className?: string }) => (
  <div className={`space-y-2.5 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-3.5 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }: SkeletonProps) => (
  <div className={`card space-y-4 ${className}`}>
    <Skeleton className="h-40 w-full rounded-xl" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-3 w-full" />
    <div className="flex justify-between pt-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

export const SkeletonTableRow = ({ cols = 5, className = '' }: { cols?: number; className?: string }) => (
  <tr className={className}>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-3.5">
        <Skeleton className={`h-4 ${i === 0 ? 'w-32' : i === cols - 1 ? 'w-16 ml-auto' : 'w-24'}`} />
      </td>
    ))}
  </tr>
);

export const SkeletonTable = ({ rows = 5, cols = 5, className = '' }: { rows?: number; cols?: number; className?: string }) => (
  <div className={`card ${className}`}>
    <div className="overflow-x-auto">
      <table className="table-premium">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}><Skeleton className="h-3 w-20" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const SkeletonKPI = ({ className = '' }: SkeletonProps) => (
  <div className={`card flex items-center gap-4 ${className}`}>
    <Skeleton className="w-12 h-12 rounded-xl" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-32" />
    </div>
  </div>
);

export const SkeletonChart = ({ className = '' }: SkeletonProps) => (
  <div className={`card ${className}`}>
    <Skeleton className="h-5 w-40 mb-6" />
    <div className="flex items-end gap-3 h-52">
      {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  </div>
);
