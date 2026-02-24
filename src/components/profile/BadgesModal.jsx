import { useState, useEffect } from 'react';
import { useModalClose } from '@/hooks/useModalClose';
import { X, Save, Lock, Trophy } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/context/ToastContext';
import clsx from 'clsx';

export function BadgesModal({ isOpen, onClose }) {
    useModalClose(isOpen, onClose);

    const { unlockedBadges, lockedBadges } = useAchievements();
    const { profile, updateProfileData } = useUserProfile();
    const { toast } = useToast();

    // Lista completa de badges
    const allBadges = [...unlockedBadges, ...lockedBadges];

    // Estado local para a seleção
    const [selectedBadges, setSelectedBadges] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Inicializar com as badges já pinadas do perfil, ou as 3 primeiras desbloqueadas
        if (profile?.featuredBadges) {
            setSelectedBadges(profile.featuredBadges);
        } else {
            // Default: Pegar as 3 primeiras unlocked IDs
            setSelectedBadges(unlockedBadges.slice(0, 3).map(b => b.id));
        }
    }, [profile, unlockedBadges]);

    const toggleBadge = (badgeId) => {
        // Só permite selecionar badges desbloqueadas
        const isUnlocked = unlockedBadges.some(b => b.id === badgeId);
        if (!isUnlocked) return;

        setSelectedBadges(prev => {
            if (prev.includes(badgeId)) {
                return prev.filter(id => id !== badgeId);
            } else {
                if (prev.length >= 3) {
                    toast.warning("Você só pode fixar até 3 conquistas.");
                    return prev;
                }
                return [...prev, badgeId];
            }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfileData({ featuredBadges: selectedBadges });
            toast.success("Conquistas fixadas atualizadas!");
            onClose();
        } catch (error) {
            toast.error("Erro ao salvar conquistas.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-[var(--bg-secondary)] w-full max-w-2xl rounded-2xl border border-[var(--border-color)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" /> Gerenciar Conquistas
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)]">Fixe até 3 conquistas no seu perfil</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-primary)]/10 rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Grid Scrollable */}
                <div className="overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {allBadges.map((badge) => {
                            const isUnlocked = unlockedBadges.some(u => u.id === badge.id);
                            const isSelected = selectedBadges.includes(badge.id);
                            const Icon = badge.icon;

                            return (
                                <div
                                    key={badge.id}
                                    onClick={() => toggleBadge(badge.id)} // Só funciona se unlocked
                                    className={clsx(
                                        "relative border rounded-xl p-4 flex flex-col items-center gap-3 transition-all cursor-pointer select-none",
                                        isUnlocked
                                            ? isSelected
                                                ? `bg-primary/10 border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] transform scale-105`
                                                : `bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10`
                                            : "opacity-50 grayscale cursor-not-allowed bg-black/20 border-white/5"
                                    )}
                                >
                                    {/* Badge Icon */}
                                    <div className={clsx(
                                        "w-12 h-12 rounded-full flex items-center justify-center transition-transform",
                                        isUnlocked ? badge.bg : "bg-gray-800",
                                        isSelected && "scale-110"
                                    )}>
                                        {isUnlocked ? (
                                            <Icon className={clsx("w-6 h-6", badge.color)} />
                                        ) : (
                                            <Lock className="w-5 h-5 text-gray-500" />
                                        )}
                                    </div>

                                    <div className="text-center">
                                        <h4 className={clsx("text-sm font-bold mb-1", isUnlocked ? "text-[var(--text-primary)]" : "text-gray-500")}>
                                            {badge.name}
                                        </h4>
                                        <p className="text-[10px] text-[var(--text-secondary)] leading-tight line-clamp-2">
                                            {badge.description}
                                        </p>
                                    </div>

                                    {/* Indicador de Seleção */}
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50 animate-pulse"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)] flex justify-between items-center gap-3">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">
                        {selectedBadges.length}/3 Selecionadas
                    </span>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]/10 hover:text-[var(--text-primary)] transition-all font-medium">
                            Cancelar
                        </button>
                        <button
                            disabled={saving}
                            onClick={handleSave}
                            className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? "Salvando..." : (
                                <>
                                    <Save className="w-4 h-4" /> Salvar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
