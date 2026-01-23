import { motion } from 'framer-motion';
import clsx from 'clsx';

export function ViewToggle({ value, onChange, options }) {
    return (
        <div className="flex items-center bg-bg-tertiary p-1 rounded-xl border border-border-color gap-1">
            {options.map((option) => (
                <ToggleOption
                    key={option.value}
                    active={value === option.value}
                    onClick={() => onChange(option.value)}
                    icon={option.icon}
                    label={option.label}
                />
            ))}
        </div>
    );
}

function ToggleOption({ active, onClick, icon: Icon, label }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "relative flex items-center justify-center p-2 rounded-lg transition-all z-10",
                // If label is present (not just icon), we might want minimum width or padding adjustment.
                // For now keeping it flexible. If it's just icon, w-10 h-10 fits well.
                // If it has text (like in Profile), we might want more width.
                // Let's use flexible padding.
                active ? "text-primary" : "text-text-secondary hover:text-text-primary"
            )}
            title={label}
        >
            <div className="flex items-center gap-2 relative z-20">
                <Icon className="w-5 h-5" />
                {/* Only show label if it breaks out of 'icon-only' mode? 
                    Actually, the user liked 'Animes' and 'Personagens' text in profile.
                    But Catalog was icon-only.
                    I should support both. If explicit width/height class passed? 
                    Or just let content dictate width.
                */}
                <span className={clsx("text-sm font-bold", !label && "hidden", label && "hidden md:block")}>
                    {/* Logic collision: Catalog icons have hidden labels basically. 
                       Profile has visible labels. 
                       Let's make 'label' prop control visibility.
                   */}
                    {label}
                </span>
            </div>

            {active && (
                <motion.div
                    layoutId="viewToggleBg"
                    className="absolute inset-0 bg-bg-secondary rounded-lg shadow-md z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
            )}
        </button>
    );
}
