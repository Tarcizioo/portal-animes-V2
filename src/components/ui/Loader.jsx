import { Loader2 } from 'lucide-react';

export function Loader({ className = "" }) {
    return (
        <div className={`flex items-center justify-center w-full h-full min-h-[200px] ${className}`}>
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
    );
}
