import clsx from 'clsx';

export function SkeletonCard({ className }) {
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