import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useEffect, useRef } from 'react';

export function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const hasShownToast = useRef(false);

    useEffect(() => {
        if (!loading && !user && !hasShownToast.current) {
            hasShownToast.current = true;
            toast.warning("Faça login para acessar esta página.", "Acesso Restrito");
        }
    }, [loading, user, toast]);

    if (loading) return null;

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return children;
}
