import clsx from 'clsx';

export function SkeletonCard({ className, viewMode = 'grid' }) {
  if (viewMode === 'list') {
      return (
        <div className={clsx("relative overflow-hidden rounded-xl bg-bg-secondary w-full p-3 flex gap-4 h-32 border border-border-color", className)}>
             {/* Shimmer Effect */}
             <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent z-10"></div>

             {/* Image Placeholder */}
             <div className="w-[80px] h-full bg-bg-tertiary rounded-lg shrink-0"></div>

             {/* Content Placeholders */}
             <div className="flex-1 flex flex-col gap-2 py-1">
                 {/* Title */}
                 <div className="h-5 w-3/4 bg-bg-tertiary rounded opacity-60"></div>
                 {/* Metadata Row */}
                 <div className="h-3 w-1/3 bg-bg-tertiary rounded opacity-40 mt-1"></div>
                 {/* Synopsis Lines */}
                 <div className="h-3 w-full bg-bg-tertiary rounded opacity-30 mt-3"></div>
                 <div className="h-3 w-5/6 bg-bg-tertiary rounded opacity-30"></div>
             </div>
        </div>
      );
  }

  return (
    <div className={clsx("relative overflow-hidden rounded-xl bg-bg-secondary w-full aspect-[2/3]", className)}>
      {/* Background base */}
      <div className="absolute inset-0 bg-bg-tertiary/30"></div>

      {/* Efeito Shimmer passando */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent z-10"></div>

      {/* Content Placeholders */}
      <div className="absolute bottom-12 left-2 right-2 h-4 bg-bg-tertiary rounded opacity-50"></div>
      <div className="absolute bottom-6 left-2 w-1/2 h-3 bg-bg-tertiary rounded opacity-30"></div>
    </div>
  );
}