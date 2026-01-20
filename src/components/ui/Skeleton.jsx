import clsx from 'clsx';

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={clsx(
                "relative overflow-hidden bg-bg-secondary rounded-xl",
                className
            )}
            {...props}
        >
            {/* Efeito Shimmer passando */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent z-10"></div>
        </div>
    );
}
