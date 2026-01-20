import { useRef, useEffect } from 'react';
import { Bell, Check, Trash2, MessageSquare, Heart, Info, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Link } from 'react-router-dom';

export function NotificationDropdown({ isOpen, onClose }) {
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getIcon = (type) => {
        switch (type) {
            case 'like': return <Heart className="w-4 h-4 text-pink-500" />;
            case 'comment': return <MessageSquare className="w-4 h-4 text-blue-500" />;
            case 'system': return <Info className="w-4 h-4 text-yellow-500" />;
            default: return <Bell className="w-4 h-4 text-primary" />;
        }
    };

    return (
        <div ref={dropdownRef} className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-bg-secondary border border-border-color rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-color bg-bg-tertiary/50">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-text-primary">Notificações</h3>
                    {unreadCount > 0 && (
                        <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-primary hover:text-primary-hover font-medium flex items-center gap-1 transition-colors"
                            title="Marcar todas como lidas"
                        >
                            <Check className="w-3 h-3" /> Limpar
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-surface-dark/20 hover:scrollbar-thumb-surface-dark/40">
                {loading ? (
                    <div className="p-8 text-center text-text-secondary text-sm">Carregando...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center gap-2 text-text-secondary">
                        <Bell className="w-8 h-8 opacity-20" />
                        <p className="text-sm">Nenhuma notificação por enquanto.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border-color/50">
                        {notifications.map(notif => (
                            <div
                                key={notif.id}
                                className={`p-4 hover:bg-bg-tertiary transition-colors relative group ${!notif.read ? 'bg-primary/5' : ''}`}
                            >
                                <Link
                                    to={notif.link || '#'}
                                    onClick={() => {
                                        markAsRead(notif.id);
                                        onClose();
                                    }}
                                    className="flex gap-3"
                                >
                                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-border-color bg-bg-primary`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-text-primary leading-snug">
                                            {notif.content}
                                        </p>
                                        <p className="text-xs text-text-secondary mt-1">
                                            {notif.createdAt.toLocaleDateString()}
                                        </p>
                                    </div>
                                </Link>

                                {!notif.read && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notif.id);
                                        }}
                                        className="absolute right-2 top-2 p-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Marcar como lida"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
