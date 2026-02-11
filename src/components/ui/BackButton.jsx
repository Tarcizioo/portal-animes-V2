import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

export function BackButton({ label = "Voltar", className, onClick }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(-1);
        }
    };

    return (
        <button 
            onClick={handleClick} 
            className={clsx(
                "flex items-center gap-2 text-text-secondary hover:text-primary transition-colors group w-fit",
                className
            )}
        >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{label}</span>
        </button>
    );
}
