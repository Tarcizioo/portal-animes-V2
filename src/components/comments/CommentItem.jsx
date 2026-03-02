import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function CommentItem({ comment, onDelete }) {
    const { user } = useAuth();

    const isOwner = user && user.uid === comment.userId;

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Agora';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    const profilePath = `/u/${comment.userId}`;

    return (
        <div className="flex gap-4 p-4 rounded-xl bg-bg-primary/50 border border-border-color hover:border-border-color/80 transition-colors group">

            {/* Avatar — clicável para o perfil */}
            <Link to={profilePath} className="shrink-0" title={`Ver perfil de ${comment.userName}`}>
                <img
                    src={comment.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=random`}
                    alt={comment.userName}
                    className="w-10 h-10 rounded-full object-cover border border-border-color hover:ring-2 hover:ring-primary/50 transition-all"
                />
            </Link>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Nome — clicável para o perfil */}
                        <Link
                            to={profilePath}
                            className="font-bold text-text-primary text-sm hover:text-primary transition-colors"
                            title={`Ver perfil de ${comment.userName}`}
                        >
                            {comment.userName}
                        </Link>
                        <span className="text-xs text-text-secondary">
                            {formatDate(comment.createdAt)}
                        </span>
                    </div>

                    {isOwner && (
                        <button
                            onClick={() => onDelete(comment.id)}
                            className="text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-md hover:bg-red-500/10 shrink-0"
                            title="Deletar comentário"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <p className="text-text-secondary text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {comment.content}
                </p>
            </div>
        </div>
    );
}
