export function ActionButton({ icon: Icon, onClick, className }) {
    return (
        <button
            onClick={onClick}
            className={`p-2.5 rounded-xl bg-bg-tertiary hover:bg-primary hover:text-white text-text-primary transition-all transform hover:scale-110 shadow-sm ${className || ''}`}
        >
            <Icon className="w-5 h-5" />
        </button>
    )
}
