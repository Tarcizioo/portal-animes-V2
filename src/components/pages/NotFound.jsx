import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary text-text-primary p-4">
            <h1 className="text-9xl font-black text-primary/20">404</h1>
            <h2 className="text-3xl font-bold mb-4">Página não encontrada</h2>
            <p className="text-text-secondary mb-8 text-center max-w-md">
                Ops! A página que você está procurando parece que não existe ou foi removida.
            </p>

            <Link
                to="/"
                className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
            >
                <Home className="w-5 h-5" />
                Voltar para o Início
            </Link>
        </div>
    );
}
