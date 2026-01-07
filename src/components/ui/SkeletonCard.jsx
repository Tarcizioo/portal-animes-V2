import clsx from 'clsx';

export function SkeletonCard({ className }) {
  return (
    <div className={clsx("animate-pulse", className)}>
      {/* Imagem Placeholder */}
      <div className="bg-gray-300 dark:bg-gray-700 aspect-[2/3] rounded-xl mb-3 w-full"></div>
      {/* Título Placeholder */}
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      {/* Gênero Placeholder */}
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
    </div>
  );
}