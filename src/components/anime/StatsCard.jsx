import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export function StatsCard({ label, value, icon: Icon, color }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-bg-secondary p-4 rounded-xl border border-border-color flex flex-col items-center justify-center gap-1 cursor-default hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-colors"
        >
            <Icon className={clsx("w-6 h-6 mb-1", color || "text-text-secondary")} />
            <span className="font-bold text-lg text-text-primary">{value}</span>
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">{label}</span>
        </motion.div>
    );
}
