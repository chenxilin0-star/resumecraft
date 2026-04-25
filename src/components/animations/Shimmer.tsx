import { cn } from '@/utils/helpers';

interface ShimmerProps {
  className?: string;
}

export default function Shimmer({ className }: ShimmerProps) {
  return (
    <div className={cn('relative overflow-hidden bg-gray-200 rounded', className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  );
}
