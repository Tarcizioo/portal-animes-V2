import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalClose } from '@/hooks/useModalClose';
import { useLibraryBackup } from '@/hooks/useLibraryBackup';
import {
    X, Download, Upload, FileJson, FileSpreadsheet,
    FileUp, CheckCircle2, AlertCircle, Loader2, Info,
} from 'lucide-react';

// ── Status labels for preview ────────────────────────────────────────────────
const STATUS_LABEL = {
    watching:      'Assistindo',
    completed:     'Completo',
    on_hold:       'Em Pausa',
    dropped:       'Dropado',
    plan_to_watch: 'Planejado',
};

// ── Small helper ──────────────────────────────────────────────────────────────
function TabButton({ active, onClick, icon: Icon, children }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all focus:outline-none ${
                active
                    ? 'bg-button-accent text-text-on-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            }`}
        >
            <Icon className="w-4 h-4" /> {children}
        </button>
    );
}

function ActionCard({ icon: Icon, title, description, onClick, variant = 'default' }) {
    const variants = {
        default: 'border-border-color hover:border-button-accent/40 hover:bg-bg-tertiary/60',
        csv:     'border-border-color hover:border-green-500/40 hover:bg-green-500/5',
    };
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border bg-bg-primary/40 transition-all text-left group focus:outline-none ${variants[variant]}`}
        >
            <div className="p-2.5 rounded-xl bg-bg-tertiary group-hover:scale-105 transition-transform flex-shrink-0">
                <Icon className="w-5 h-5 text-button-accent" />
            </div>
            <div>
                <p className="font-bold text-text-primary text-sm">{title}</p>
                <p className="text-xs text-text-secondary mt-0.5">{description}</p>
            </div>
            <Download className="w-4 h-4 text-text-secondary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export function BackupModal({ isOpen, onClose, library = [] }) {
    useModalClose(isOpen, onClose);
    const { exportJSON, exportCSV, parseJSON, parseMAL, commitImport } = useLibraryBackup(library);

    const [tab, setTab] = useState('export');
    // Import state
    const [preview, setPreview]       = useState(null);   // { count, items }
    const [overwrite, setOverwrite]   = useState(true);
    const [importing, setImporting]   = useState(false);
    const [progress, setProgress]     = useState(0);
    const [result, setResult]         = useState(null);   // { success, message }
    const [parseError, setParseError] = useState(null);
    const [dragging, setDragging]     = useState(false);
    const fileRef = useRef(null);

    const resetImport = () => {
        setPreview(null);
        setResult(null);
        setParseError(null);
        setProgress(0);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleFile = async (file) => {
        if (!file) return;
        resetImport();
        try {
            let parsed;
            if (file.name.endsWith('.xml')) {
                parsed = await parseMAL(file);
            } else {
                parsed = await parseJSON(file);
            }
            setPreview(parsed);
        } catch (err) {
            setParseError(err.message);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleImport = async () => {
        if (!preview?.items?.length) return;
        setImporting(true);
        setProgress(0);
        try {
            await commitImport(preview.items, overwrite, (done, total) => {
                setProgress(Math.round((done / total) * 100));
            });
            setResult({ success: true, message: `${preview.count} animes importados com sucesso!` });
            setPreview(null);
        } catch (err) {
            setResult({ success: false, message: err.message });
        } finally {
            setImporting(false);
        }
    };

    if (!isOpen) return null;

    const modal = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-bg-secondary w-full max-w-lg rounded-3xl border border-border-color shadow-2xl flex flex-col max-h-[88vh]"
                        initial={{ scale: 0.92, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-border-color flex-shrink-0">
                            <h2 className="font-bold text-text-primary flex items-center gap-2">
                                <Download className="w-4 h-4 text-button-accent" />
                                Backup da Biblioteca
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-full text-text-secondary hover:text-text-primary transition-colors focus:outline-none">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 px-5 pt-4 flex-shrink-0">
                            <TabButton active={tab === 'export'} onClick={() => setTab('export')} icon={Download}>Exportar</TabButton>
                            <TabButton active={tab === 'import'} onClick={() => { setTab('import'); resetImport(); }} icon={Upload}>Importar</TabButton>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 p-5 space-y-4 flex-1">

                            {/* ── EXPORT TAB ──────────────────────────────── */}
                            {tab === 'export' && (
                                <>
                                    <div className="flex items-center gap-2 p-3 bg-button-accent/10 border border-button-accent/20 rounded-xl text-xs text-button-accent">
                                        <Info className="w-3.5 h-3.5 flex-shrink-0" />
                                        {library.length} animes serão exportados
                                    </div>
                                    <ActionCard
                                        icon={FileJson}
                                        title="Exportar JSON"
                                        description="Fidelidade total — use para reimportar aqui depois"
                                        onClick={exportJSON}
                                    />
                                    <ActionCard
                                        icon={FileSpreadsheet}
                                        title="Exportar CSV"
                                        description="Compatível com Excel, Google Sheets e outros"
                                        onClick={exportCSV}
                                        variant="csv"
                                    />
                                </>
                            )}

                            {/* ── IMPORT TAB ──────────────────────────────── */}
                            {tab === 'import' && (
                                <>
                                    {/* Format hint */}
                                    <div className="flex items-start gap-2 p-3 bg-bg-primary/50 border border-border-color rounded-xl text-xs text-text-secondary">
                                        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-button-accent" />
                                        <span>
                                            Aceita <strong className="text-text-primary">.json</strong> (exportado aqui) ou
                                            <strong className="text-text-primary"> .xml</strong> do MyAnimeList
                                            <span className="ml-1 opacity-70">(Perfil → Export → Anime List)</span>
                                        </span>
                                    </div>

                                    {/* Result message */}
                                    {result && (
                                        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold ${
                                            result.success
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                            {result.success
                                                ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                                : <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            }
                                            {result.message}
                                        </div>
                                    )}

                                    {/* Parse error */}
                                    {parseError && (
                                        <div className="flex items-center gap-2 p-3 rounded-xl text-sm bg-red-500/10 text-red-400 border border-red-500/20">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            {parseError}
                                        </div>
                                    )}

                                    {/* Dropzone */}
                                    {!preview && !result && (
                                        <div
                                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                            onDragLeave={() => setDragging(false)}
                                            onDrop={handleDrop}
                                            onClick={() => fileRef.current?.click()}
                                            className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                                                dragging
                                                    ? 'border-button-accent bg-button-accent/10 scale-[1.01]'
                                                    : 'border-border-color hover:border-button-accent/50 hover:bg-bg-tertiary/40'
                                            }`}
                                        >
                                            <div className="p-4 bg-bg-tertiary rounded-2xl">
                                                <FileUp className="w-8 h-8 text-button-accent" />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-bold text-text-primary text-sm">Arraste ou clique para selecionar</p>
                                                <p className="text-xs text-text-secondary mt-1">.json · .xml (MyAnimeList)</p>
                                            </div>
                                            <input
                                                ref={fileRef}
                                                type="file"
                                                accept=".json,.xml"
                                                className="hidden"
                                                onChange={e => handleFile(e.target.files[0])}
                                            />
                                        </div>
                                    )}

                                    {/* Preview */}
                                    {preview && !importing && !result && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-400 font-semibold">
                                                <CheckCircle2 className="w-4 h-4" />
                                                {preview.count} animes encontrados no arquivo
                                            </div>

                                            {/* Mini preview list */}
                                            <div className="max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 space-y-1 rounded-xl bg-bg-primary/40 border border-border-color p-2">
                                                {preview.items.slice(0, 8).map((a, i) => (
                                                    <div key={i} className="flex items-center justify-between text-xs px-2 py-1">
                                                        <span className="text-text-primary font-medium truncate max-w-[60%]">{a.title}</span>
                                                        <span className="text-text-secondary">{STATUS_LABEL[a.status] || a.status}</span>
                                                    </div>
                                                ))}
                                                {preview.count > 8 && (
                                                    <p className="text-center text-xs text-text-secondary py-1">
                                                        + {preview.count - 8} mais...
                                                    </p>
                                                )}
                                            </div>

                                            {/* Options */}
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={overwrite}
                                                    onChange={e => setOverwrite(e.target.checked)}
                                                    className="w-4 h-4 accent-button-accent rounded"
                                                />
                                                <span className="text-sm text-text-secondary">Substituir animes já existentes</span>
                                            </label>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={resetImport}
                                                    className="flex-1 py-2 rounded-xl border border-border-color text-sm text-text-secondary hover:bg-bg-tertiary focus:outline-none transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={handleImport}
                                                    className="flex-1 py-2 rounded-xl bg-button-accent text-text-on-primary text-sm font-bold hover:opacity-90 focus:outline-none transition-opacity"
                                                >
                                                    Importar {preview.count} animes
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Progress */}
                                    {importing && (
                                        <div className="space-y-3 py-4">
                                            <div className="flex items-center justify-center gap-3 text-text-secondary">
                                                <Loader2 className="w-5 h-5 animate-spin text-button-accent" />
                                                <span className="text-sm font-medium">Importando... {progress}%</span>
                                            </div>
                                            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-button-accent rounded-full"
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(modal, document.body);
}
