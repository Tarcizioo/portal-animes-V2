import { Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function CommentItem({ comment, onDelete }) {
    const { user } = useAuth();

    // Check if current user is the owner of the comment
    const isOwner = user && user.uid === comment.userId;

    // Format Date
    const formatDate = (timestamp) => {
        if (!timestamp) return "Agora";
        // Convert Firebase Timestamp to JS Date
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="flex gap-4 p-4 rounded-xl bg-bg-primary/50 border border-border-color hover:border-border-color/80 transition-colors group">
            {/* Avatar */}
            <div className="shrink-0">
                <img
                    src={comment.userAvatar || `https://ui-avatars.com/api/?name=${comment.userName}&background=random`}
                    alt={comment.userName}
                    className="w-10 h-10 rounded-full object-cover border border-border-color"
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary text-sm">
                            {comment.userName}
                        </span>
                        <span className="text-xs text-text-secondary">
                            {formatDate(comment.createdAt)}
                        </span>
                    </div>

                    {isOwner && (
                        <button
                            onClick={() => onDelete(comment.id)}
                            className="text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-md hover:bg-red-500/10"
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
