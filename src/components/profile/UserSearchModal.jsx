import { useState, useEffect } from 'react';
import { Search, User, Loader2, ArrowRight } from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Link } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';

export function UserSearchModal({ isOpen, onClose }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [debouncedTerm, setDebouncedTerm] = useState('');

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Keyboard events (ESC) - Modal doesn't handle this natively
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Search logic
    useEffect(() => {
        async function searchUsers() {
            if (debouncedTerm.length < 3) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const usersRef = collection(db, 'users');

                // Heurística de Case Insensitive (Semi-fix):
                // Como o Firestore é Case Sensitive, e a maioria dos nomes começa com Maiúscula,
                // vamos capitalizar a primeira letra da busca.
                // Idealmente, salvaríamos um campo 'searchName' em minúsculo no banco.
                const term = debouncedTerm.charAt(0).toUpperCase() + debouncedTerm.slice(1).toLowerCase();

                const q = query(
                    usersRef,
                    where('displayName', '>=', term),
                    where('displayName', '<=', term + '\uf8ff'),
                    limit(20)
                );

                const snapshot = await getDocs(q);
                const users = snapshot.docs
                    .map(doc => ({ uid: doc.id, ...doc.data() }))
                    .filter(u => u.isPublic !== false);

                setResults(users);
            } catch (error) {
                console.error("Error searching users:", error);
            } finally {
                setLoading(false);
            }
        }

        if (isOpen) searchUsers();
    }, [debouncedTerm, isOpen]);

    // Clear on close
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setResults([]);
        }
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <span className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" /> Explorar Usuários
                </span>
            }
        >
            <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        autoFocus
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-bg-secondary border border-border-color rounded-xl pl-12 pr-12 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium placeholder-text-secondary/50"
                    />
                    {loading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        </div>
                    )}
                </div>

                {/* Results List */}
                <div className="space-y-2 min-h-[200px]">
                    {results.length > 0 ? (
                        results.map(user => (
                            <Link
                                key={user.uid}
                                to={`/u/${user.uid}`}
                                onClick={onClose}
                                className="flex items-center gap-4 p-3 rounded-xl bg-bg-secondary/50 border border-transparent hover:border-primary/30 hover:bg-bg-secondary hover:shadow-md transition-all group"
                            >
                                <img
                                    src={user.photoURL || "https://placehold.co/100x100/6366f1/FFF?text=U"}
                                    alt={user.displayName}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-border-color group-hover:border-primary/50 transition-colors"
                                    crossOrigin="anonymous"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-text-primary truncate group-hover:text-primary transition-colors">
                                            {user.displayName || "Usuário"}
                                        </h4>
                                        {user.isPublic === false && (
                                            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-wider border border-red-500/20">
                                                Privado
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-text-secondary truncate pr-2">
                                        {user.about || "Membro da comunidade"}
                                    </p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-text-secondary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </Link>
                        ))
                    ) : debouncedTerm.length >= 3 ? (
                        <div className="text-center py-12">
                            <p className="text-text-secondary text-lg font-medium">Nenhum usuário encontrado</p>
                            <p className="text-sm text-text-secondary/60 mt-1">Tente buscar por outro nome</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-text-secondary/40">
                            <User className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-sm font-medium">Digite o nome de um usuário para buscar</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
