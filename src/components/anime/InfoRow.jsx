import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export function InfoRow({ icon: Icon, label, value, color, highlight }) {
    return (
        <motion.div
            whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.03)" }}
            className="flex items-center justify-between text-sm p-2 rounded-lg cursor-default transition-colors"
        >
            <div className="flex items-center gap-2 text-text-secondary">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
            </div>
            <span className={clsx("font-medium truncate max-w-[50%]", color, highlight && "text-primary font-bold")}>
                {value || '-'}
            </span>
        </motion.div>
    );
}
