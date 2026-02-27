import { createPortal } from 'react-dom';
import { useState } from 'react';
import { useModalClose } from '@/hooks/useModalClose';
import { X, Heart, Tv, Star, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// ── Gauge SVG ─────────────────────────────────────────────────────────────────
function CompatibilityGauge({ score }) {
    const R    = 64;
    const CX   = 90;
    const CY   = 78;
    const circ = Math.PI * R;
    const dash = (score / 100) * circ;
    const gap  = circ - dash;

    const color = score >= 70 ? 'var(--button-accent)'
                : score >= 40 ? '#f59e0b'
                : '#ef4444';

    return (
        <div className="flex flex-col items-center gap-1">
            <svg width={180} height={92} viewBox="0 0 180 92">
                <path
                    d={`M ${CX - R},${CY} A ${R},${R} 0 0,1 ${CX + R},${CY}`}
                    fill="none" stroke="var(--bg-tertiary)" strokeWidth={13} strokeLinecap="round"
                />
                <motion.path
                    d={`M ${CX - R},${CY} A ${R},${R} 0 0,1 ${CX + R},${CY}`}
                    fill="none" stroke={color} strokeWidth={13} strokeLinecap="round"
                    strokeDasharray={`${circ}`}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: gap }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                />
                <text x={CX} y={CY - 10} textAnchor="middle" fill="var(--text-primary)"
                    fontSize={26} fontWeight={900} fontFamily="inherit">{score}%</text>
                <text x={CX} y={CY + 8} textAnchor="middle" fill="var(--text-secondary)"
                    fontSize={10} fontFamily="inherit">Compatível</text>
            </svg>
        </div>
    );
}

// ── Expandable Breakdown Bar ──────────────────────────────────────────────────
function BreakdownSection({ id, label, value, icon: Icon, isOpen, onToggle, children }) {
    return (
        <div className="rounded-xl bg-bg-primary/40 border border-border-color overflow-hidden">
            {/* Header row — clickable */}
            <button
                onClick={() => onToggle(id)}
                className="w-full flex items-center gap-2 p-3 hover:bg-bg-tertiary/40 transition-colors group focus:outline-none"
            >
                <Icon className="w-3.5 h-3.5 text-button-accent flex-shrink-0" />
                <span className="text-sm text-text-secondary font-medium flex-1 text-left">{label}</span>
                <span className="font-bold text-text-primary text-sm mr-2">{value}%</span>
                <ChevronDown className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Progress bar */}
            <div className="h-1.5 bg-bg-tertiary mx-3 mb-1 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-button-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                />
            </div>

            {/* Accordion detail */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-3 pt-1">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Shared Anime grid (inside accordion) ─────────────────────────────────────
function SharedAnimeDetail({ sharedAnimes, onClose }) {
    if (!sharedAnimes.length) {
        return (
            <div className="text-center py-4 text-text-secondary text-xs italic">
                Nenhum anime em comum ainda.
            </div>
        );
    }
    return (
        <div className="grid grid-cols-2 gap-2 mt-2">
            {sharedAnimes.map(anime => (
                <Link
                    key={anime.id}
                    to={`/anime/${anime.id}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5 p-2 bg-bg-secondary rounded-xl hover:bg-bg-tertiary border border-border-color hover:border-button-accent/30 transition-all group"
                >
                    <img src={anime.image} alt={anime.title}
                        className="w-9 h-13 rounded-lg object-cover flex-shrink-0" style={{ height: 52 }} />
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-text-primary line-clamp-2 leading-tight group-hover:text-button-accent transition-colors">
                            {anime.title}
                        </p>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {anime.myScore > 0 && (
                                <span className="text-[10px] bg-button-accent/15 text-button-accent px-1.5 py-0.5 rounded font-bold">
                                    Você: {anime.myScore}
                                </span>
                            )}
                            {anime.pubScore > 0 && (
                                <span className="text-[10px] bg-white/5 text-text-secondary px-1.5 py-0.5 rounded font-bold">
                                    Ele: {anime.pubScore}
                                </span>
                            )}
                        </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-text-secondary opacity-0 group-hover:opacity-100 flex-shrink-0" />
                </Link>
            ))}
        </div>
    );
}

// ── Genre overlap detail ──────────────────────────────────────────────────────
function GenreDetail({ commonGenres }) {
    if (!commonGenres.length) {
        return <p className="text-xs text-text-secondary italic mt-2">Nenhum gênero em comum.</p>;
    }
    return (
        <div className="flex flex-wrap gap-1.5 mt-2">
            {commonGenres.map(g => (
                <span key={g}
                    className="px-2.5 py-1 bg-button-accent/10 border border-button-accent/20 text-button-accent text-xs font-semibold rounded-full">
                    {g}
                </span>
            ))}
        </div>
    );
}

// ── Score affinity detail ─────────────────────────────────────────────────────
function ScoreAffinityDetail({ myAvgScore, pubAvgScore, otherName }) {
    const max = 10;
    return (
        <div className="mt-2 space-y-3">
            {[
                { label: 'Sua média', value: myAvgScore, color: 'var(--button-accent)' },
                { label: `Média de ${otherName}`, value: pubAvgScore, color: '#a78bfa' },
            ].map(({ label, value, color }) => (
                <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs text-text-secondary font-medium">
                        <span>{label}</span>
                        <span className="font-bold text-text-primary">{value > 0 ? value.toFixed(1) : '—'} / 10</span>
                    </div>
                    <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(value / max) * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
                        />
                    </div>
                </div>
            ))}
            {myAvgScore > 0 && pubAvgScore > 0 && (
                <p className="text-xs text-text-secondary text-center pt-1">
                    Diferença de {Math.abs(myAvgScore - pubAvgScore).toFixed(1)} pontos nas médias
                </p>
            )}
        </div>
    );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export function CompatibilityModal({
    isOpen, onClose,
    score, sharedAnimes, sharedCount, genreOverlap, scoreAffinity,
    commonGenres = [], myAvgScore = 0, pubAvgScore = 0,
    otherName,
}) {
    useModalClose(isOpen, onClose);
    const [openSection, setOpenSection] = useState(null);

    const toggle = (id) => setOpenSection(prev => prev === id ? null : id);

    if (!isOpen) return null;

    const label = score >= 80 ? '🔥 Combinação Incrível!'
                : score >= 60 ? '💜 Muito Compatíveis'
                : score >= 40 ? '👍 Gosto em Comum'
                : score >= 20 ? '🤔 Diferenças de Gosto'
                : '😅 Gostos Bem Diferentes';

    const modal = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-bg-secondary w-full max-w-xl rounded-3xl border border-border-color shadow-2xl relative flex flex-col max-h-[90vh]"
                        initial={{ scale: 0.92, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-border-color flex-shrink-0">
                            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                                Compatibilidade com {otherName}
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-full text-text-secondary hover:text-text-primary transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-5 space-y-4">
                            {/* Gauge + label */}
                            <div className="flex flex-col items-center gap-1">
                                <CompatibilityGauge score={score} />
                                <span className="text-sm font-bold text-text-secondary">{label}</span>
                            </div>

                            {/* Breakdown accordion */}
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
                                    Detalhamento — clique para expandir
                                </p>

                                <BreakdownSection
                                    id="animes" label={`${sharedCount} Animes em comum`}
                                    value={Math.min(100, Math.round(sharedCount * 5))}
                                    icon={Tv} isOpen={openSection === 'animes'} onToggle={toggle}
                                >
                                    <SharedAnimeDetail sharedAnimes={sharedAnimes} onClose={onClose} />
                                </BreakdownSection>

                                <BreakdownSection
                                    id="genres" label="Gêneros sobrepostos"
                                    value={genreOverlap} icon={Star}
                                    isOpen={openSection === 'genres'} onToggle={toggle}
                                >
                                    <GenreDetail commonGenres={commonGenres} />
                                </BreakdownSection>

                                <BreakdownSection
                                    id="scores" label="Afinidade de notas"
                                    value={scoreAffinity} icon={Heart}
                                    isOpen={openSection === 'scores'} onToggle={toggle}
                                >
                                    <ScoreAffinityDetail
                                        myAvgScore={myAvgScore}
                                        pubAvgScore={pubAvgScore}
                                        otherName={otherName}
                                    />
                                </BreakdownSection>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(modal, document.body);
}
