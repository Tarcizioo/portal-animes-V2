import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalClose } from '@/hooks/useModalClose';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { useAnimeLibrary } from '@/hooks/useAnimeLibrary';
import { useLibraryBackup } from '@/hooks/useLibraryBackup';
import {
    Moon, Sun, Palette, Monitor, Trash2, AlertTriangle, X,
    Download, FileJson, FileSpreadsheet, FileUp,
    Loader2, CheckCircle2, AlertCircle, Settings,
} from 'lucide-react';

// ── Theme data ────────────────────────────────────────────────────────────────
const themes = [
    { id: 'light',     name: 'Claro',    icon: Sun,     color: 'bg-gray-100'   },
    { id: 'sunshine',  name: 'Sunshine', icon: Sun,     color: 'bg-yellow-100' },
    { id: 'matcha',    name: 'Matcha',   icon: Palette, color: 'bg-green-100'  },
    { id: 'rose',      name: 'Rose',     icon: Palette, color: 'bg-rose-100'   },
    { id: 'dark',      name: 'Escuro',   icon: Moon,    color: 'bg-gray-800'   },
    { id: 'majorelle', name: 'Blue',     icon: Palette, color: 'bg-indigo-900' },
    { id: 'blood',     name: 'Blood',    icon: Palette, color: 'bg-red-900'    },
    { id: 'dracula',   name: 'Dracula',  icon: Palette, color: 'bg-purple-900' },
];

const TABS = [
    { id: 'appearance', label: 'Aparência' },
    { id: 'library',    label: 'Biblioteca' },
    { id: 'account',    label: 'Conta'      },
];

// ── Tab button ────────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all focus:outline-none ${
                active
                    ? 'bg-button-accent text-text-on-primary shadow'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            }`}
        >
            {children}
        </button>
    );
}

// ── Appearance tab ────────────────────────────────────────────────────────────
function AppearanceTab({ theme, setTheme }) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2 mb-4">
                    <Monitor className="w-4 h-4" /> Tema
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {themes.map(t => {
                        const Icon = t.icon;
                        const isActive = theme === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 focus:outline-none ${
                                    isActive
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border-color hover:border-primary/50 hover:bg-bg-tertiary'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${isActive ? 'bg-primary text-text-on-primary' : 'bg-bg-tertiary text-text-secondary'}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-text-secondary'}`}>{t.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ── Library/Backup tab ────────────────────────────────────────────────────────
function LibraryTab({ library }) {
    const { exportJSON, exportCSV, parseJSON, parseMAL, commitImport } = useLibraryBackup(library);

    const [preview, setPreview]       = useState(null);
    const [overwrite, setOverwrite]   = useState(true);
    const [importing, setImporting]   = useState(false);
    const [progress, setProgress]     = useState(0);
    const [result, setResult]         = useState(null);
    const [parseError, setParseError] = useState(null);
    const [dragging, setDragging]     = useState(false);
    const fileRef = useRef(null);

    const reset = () => {
        setPreview(null); setResult(null);
        setParseError(null); setProgress(0);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleFile = async (file) => {
        if (!file) return;
        reset();
        try {
            const parsed = file.name.endsWith('.xml') ? await parseMAL(file) : await parseJSON(file);
            setPreview(parsed);
        } catch (err) { setParseError(err.message); }
    };

    const handleImport = async () => {
        if (!preview?.items?.length) return;
        setImporting(true); setProgress(0);
        try {
            await commitImport(preview.items, overwrite,
                (done, total) => setProgress(Math.round((done / total) * 100)));
            setResult({ success: true, message: `${preview.count} animes importados!` });
            setPreview(null);
        } catch (err) {
            setResult({ success: false, message: err.message });
        } finally { setImporting(false); }
    };

    return (
        <div className="space-y-6">
            {/* Export */}
            <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Exportar
                </h3>
                <p className="text-xs text-text-secondary mb-3">
                    {library.length} animes na sua biblioteca
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={exportJSON}
                        className="flex items-center justify-center gap-2 p-4 rounded-xl border border-border-color bg-bg-primary/40 hover:border-button-accent/40 hover:bg-bg-tertiary transition-all text-sm font-semibold text-text-secondary hover:text-text-primary focus:outline-none"
                    >
                        <FileJson className="w-5 h-5 text-button-accent" />
                        <div className="text-left">
                            <div>Exportar JSON</div>
                            <div className="text-xs font-normal opacity-60">Fidelidade total</div>
                        </div>
                    </button>
                    <button
                        onClick={exportCSV}
                        className="flex items-center justify-center gap-2 p-4 rounded-xl border border-border-color bg-bg-primary/40 hover:border-green-500/40 hover:bg-green-500/5 transition-all text-sm font-semibold text-text-secondary hover:text-text-primary focus:outline-none"
                    >
                        <FileSpreadsheet className="w-5 h-5 text-green-400" />
                        <div className="text-left">
                            <div>Exportar CSV</div>
                            <div className="text-xs font-normal opacity-60">Excel / Sheets</div>
                        </div>
                    </button>
                </div>
            </div>

            <div className="h-px bg-border-color" />

            {/* Import */}
            <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileUp className="w-4 h-4" /> Importar
                </h3>

                {result && (
                    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold mb-3 ${result.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {result.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {result.message}
                        <button onClick={reset} className="ml-auto text-xs underline opacity-70 hover:opacity-100 focus:outline-none">Nova importação</button>
                    </div>
                )}
                {parseError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl text-sm bg-red-500/10 text-red-400 border border-red-500/20 mb-3">
                        <AlertCircle className="w-4 h-4" />{parseError}
                    </div>
                )}

                {!preview && !result && !importing && (
                    <div
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                        onClick={() => fileRef.current?.click()}
                        className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${dragging ? 'border-button-accent bg-button-accent/10 scale-[1.01]' : 'border-border-color hover:border-button-accent/50 hover:bg-bg-tertiary/40'}`}
                    >
                        <div className="p-3 bg-bg-tertiary rounded-2xl">
                            <FileUp className="w-7 h-7 text-button-accent" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-text-primary text-sm">Arraste ou clique para selecionar</p>
                            <p className="text-xs text-text-secondary mt-1">.json (nosso formato) · .xml (MyAnimeList)</p>
                        </div>
                        <input ref={fileRef} type="file" accept=".json,.xml" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                    </div>
                )}

                {preview && !importing && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-400 font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            {preview.count} animes encontrados no arquivo
                        </div>
                        <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 rounded-xl bg-bg-primary/40 border border-border-color p-2 space-y-1">
                            {preview.items.slice(0, 8).map((a, i) => (
                                <div key={i} className="flex justify-between text-xs px-2 py-0.5">
                                    <span className="text-text-primary truncate max-w-[65%]">{a.title}</span>
                                    <span className="text-text-secondary capitalize">{a.status?.replace('_', ' ')}</span>
                                </div>
                            ))}
                            {preview.count > 8 && <p className="text-center text-xs text-text-secondary py-1">+ {preview.count - 8} mais...</p>}
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary">
                            <input type="checkbox" checked={overwrite} onChange={e => setOverwrite(e.target.checked)} className="accent-button-accent" />
                            Substituir animes já existentes
                        </label>
                        <div className="flex gap-2">
                            <button onClick={reset} className="flex-1 py-2 rounded-xl border border-border-color text-sm text-text-secondary hover:bg-bg-tertiary focus:outline-none">Cancelar</button>
                            <button onClick={handleImport} className="flex-1 py-2 rounded-xl bg-button-accent text-text-on-primary text-sm font-bold hover:opacity-90 focus:outline-none">
                                Importar {preview.count} animes
                            </button>
                        </div>
                    </div>
                )}

                {importing && (
                    <div className="space-y-3 py-4">
                        <div className="flex items-center justify-center gap-3 text-text-secondary">
                            <Loader2 className="w-5 h-5 animate-spin text-button-accent" />
                            <span className="text-sm font-medium">Importando... {progress}%</span>
                        </div>
                        <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                            <div className="h-full bg-button-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Account tab ───────────────────────────────────────────────────────────────
function AccountTab({ user, deleteAccount, onClose }) {
    const [isDeleting, setIsDeleting]           = useState(false);
    const [confirmText, setConfirmText]         = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = async () => {
        if (confirmText !== 'DELETAR') return;
        setIsDeleting(true);
        try {
            await deleteAccount();
            onClose();
        } catch {
            alert('Erro ao deletar conta. Talvez seja necessário fazer login novamente por segurança.');
        } finally { setIsDeleting(false); }
    };

    if (!user) return (
        <div className="p-4 rounded-xl bg-bg-tertiary border border-border-color text-center">
            <p className="text-text-secondary text-sm">Faça login para ver as opções da conta.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden">
                <div className="p-4">
                    <h4 className="flex items-center gap-2 text-red-500 font-bold mb-2">
                        <AlertTriangle className="w-5 h-5" /> Zona de Perigo
                    </h4>
                    <p className="text-sm text-text-secondary mb-4">
                        A exclusão da conta é permanente e não pode ser desfeita. Todos os seus dados serão apagados.
                    </p>
                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" /> Excluir minha conta
                        </button>
                    ) : (
                        <div className="space-y-3 bg-bg-tertiary p-4 rounded-lg">
                            <label className="text-sm text-text-secondary block">
                                Digite <span className="font-bold text-text-primary">DELETAR</span> para confirmar:
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={e => setConfirmText(e.target.value)}
                                className="w-full bg-bg-primary border border-red-500/30 rounded-lg px-3 py-2 text-text-primary focus:border-red-500 focus:outline-none text-sm"
                                placeholder="DELETAR"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDelete}
                                    disabled={confirmText !== 'DELETAR' || isDeleting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition-colors"
                                >
                                    {isDeleting ? 'Apagando...' : 'Confirmar Exclusão'}
                                </button>
                                <button
                                    onClick={() => { setShowDeleteConfirm(false); setConfirmText(''); }}
                                    className="px-4 py-2 text-text-secondary hover:text-text-primary text-sm font-medium focus:outline-none"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export function SettingsModal({ isOpen, onClose }) {
    useModalClose(isOpen, onClose);
    const { theme, setTheme } = useTheme();
    const { deleteAccount, user } = useAuth();
    const { library } = useAnimeLibrary();
    const [activeTab, setActiveTab] = useState('appearance');

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-bg-secondary w-full max-w-2xl rounded-3xl border border-border-color shadow-2xl flex flex-col max-h-[88vh]"
                        initial={{ scale: 0.92, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-5 pb-0 flex-shrink-0">
                            <h2 className="font-bold text-text-primary flex items-center gap-2 text-base">
                                <Settings className="w-4 h-4 text-button-accent" />
                                Configurações
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-full text-text-secondary hover:text-text-primary transition-colors focus:outline-none">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 px-6 pt-4 pb-3 border-b border-border-color flex-shrink-0">
                            {TABS.map(t => (
                                <TabBtn key={t.id} active={activeTab === t.id} onClick={() => setActiveTab(t.id)}>
                                    {t.label}
                                </TabBtn>
                            ))}
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 p-6 flex-1 min-h-[400px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {activeTab === 'appearance' && <AppearanceTab theme={theme} setTheme={setTheme} />}
                                    {activeTab === 'library'    && <LibraryTab library={library} />}
                                    {activeTab === 'account'   && <AccountTab user={user} deleteAccount={deleteAccount} onClose={onClose} />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
