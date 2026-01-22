import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Plus, GripVertical, User, Pin, Pencil, Check, X } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clsx } from 'clsx';

// --- Components Helpers ---

function FavoriteCard({ item, type, isOverlay = false, isEditing = false, dragListeners = {}, dragAttributes = {} }) {
    const linkPath = type === 'anime' ? `/anime/${item.id}` : `/character/${item.id}`;

    return (
        <div className={clsx(
            "relative aspect-[2/3] rounded-xl overflow-hidden bg-bg-tertiary border border-border-color shadow-sm group transition-all",
            isOverlay && "cursor-grabbing scale-105 shadow-2xl ring-2 ring-primary z-50",
            isEditing && "hover:border-primary/50"
        )}>
            {/* Drag Handle (Only in Edit Mode) */}
            {isEditing && (
                <div
                    {...dragListeners}
                    {...dragAttributes}
                    className="absolute top-2 right-2 z-20 p-2 bg-black/60 backdrop-blur-md rounded-lg cursor-grab active:cursor-grabbing hover:bg-primary transition-colors touch-none shadow-lg"
                >
                    <GripVertical className="w-4 h-4 text-white" />
                </div>
            )}

            <Link
                to={isEditing ? "#" : linkPath} // Disable link in edit mode prevent accidental clicks
                className={clsx("block w-full h-full", isEditing && "pointer-events-none")}
                draggable={false}
            >
                <img
                    src={item.image}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 p-3 w-full">
                    <h4 className="text-white text-xs md:text-sm font-bold line-clamp-2 leading-tight drop-shadow-md">
                        {item.title || item.name}
                    </h4>
                </div>
            </Link>
        </div>
    );
}

function SortableFavoriteItem({ item, type, isEditing }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id, disabled: !isEditing });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        touchAction: 'none'
    };

    return (
        <div ref={setNodeRef} style={style}>
            <FavoriteCard
                item={item}
                type={type}
                isEditing={isEditing}
                dragListeners={listeners}
                dragAttributes={attributes}
            />
        </div>
    );
}

// --- Main Widget ---

export function FavoritesWidget({
    animeFavorites,
    characterFavorites,
    onReorderAnimes,
    onReorderCharacters,
    preferredView,
    onSetPreferredView,
    readOnly = false
}) {
    const [activeTab, setActiveTab] = useState(preferredView || 'anime');
    const [isEditing, setIsEditing] = useState(false);

    // Sync preference
    useEffect(() => {
        if (preferredView) setActiveTab(preferredView);
    }, [preferredView]);

    const isPinned = preferredView === activeTab;
    const propItems = activeTab === 'anime' ? animeFavorites : characterFavorites;
    const type = activeTab;

    // Local State (Slice to top 6)
    const [localItems, setLocalItems] = useState(propItems.slice(0, 6));

    // Update local items when props change (and slice again to ensure limits)
    useEffect(() => {
        setLocalItems(propItems.slice(0, 6));
    }, [propItems, activeTab]);

    // Dnd State
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setLocalItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Notify parent
                const newOrderIds = newOrder.map(item => item.id);

                // IMPORTANT: We must merge this "reordered top 6" with the "rest of the favorites" 
                // to preserve the full list order, otherwise we lose data.
                const restOfItems = propItems.slice(6).map(i => i.id);
                const fullIds = [...newOrderIds, ...restOfItems];

                if (activeTab === 'anime') {
                    onReorderAnimes(fullIds);
                } else {
                    onReorderCharacters(fullIds);
                }

                return newOrder;
            });
        }
        setActiveId(null);
    };

    const handlePin = () => {
        if (isPinned) {
            onSetPreferredView(null);
        } else {
            onSetPreferredView(activeTab);
        }
    };

    return (
        <div className="bg-bg-secondary border border-border-color rounded-2xl p-6 relative overflow-hidden">

            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">

                <div className="flex items-center gap-4">
                    {/* Modern Tab Switcher */}
                    <div className="flex p-1 bg-bg-tertiary rounded-xl border border-border-color">
                        {['anime', 'character'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setIsEditing(false); }}
                                className={clsx(
                                    "px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                                    activeTab === tab
                                        ? "bg-bg-secondary text-primary shadow-sm ring-1 ring-border-color"
                                        : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                                )}
                            >
                                {tab === 'anime' ? <Heart className={clsx("w-4 h-4", activeTab === 'anime' && "fill-current")} /> : <User className={clsx("w-4 h-4", activeTab === 'character' && "fill-current")} />}
                                {tab === 'anime' ? 'Animes' : 'Personagens'}
                            </button>
                        ))}
                    </div>

                    {/* Count Badge */}
                    <span className="text-xs font-bold text-text-secondary bg-bg-tertiary px-3 py-1.5 rounded-full border border-border-color">
                        {localItems.length} / 6
                    </span>
                </div>

                {/* Actions */}
                {!readOnly && (
                    <div className="flex items-center gap-2">
                        {/* Edit Toggle */}
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={clsx(
                                "flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border transition-all",
                                isEditing
                                    ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                                    : "bg-bg-tertiary text-text-secondary border-border-color hover:text-text-primary hover:bg-bg-tertiary/80"
                            )}
                        >
                            {isEditing ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                            {isEditing ? 'Concluir' : 'Organizar'}
                        </button>

                        {/* Pin Button */}
                        <button
                            onClick={handlePin}
                            className={clsx(
                                "p-2 rounded-lg border transition-all",
                                isPinned
                                    ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                                    : "bg-transparent text-text-secondary border-transparent hover:bg-bg-tertiary"
                            )}
                            title={isPinned ? "Visão padrão definida" : "Definir como visão padrão"}
                        >
                            <Pin className={clsx("w-4 h-4", isPinned && "fill-current")} />
                        </button>
                    </div>
                )}
            </div>

            {/* Grid Area */}
            {readOnly ? (
                // Static View
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 relative z-10">
                    {localItems.map((item) => (
                        <FavoriteCard key={item.id} item={item} type={type} />
                    ))}
                    {localItems.length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-border-color rounded-xl">
                            <Heart className="w-12 h-12 text-text-secondary/20 mx-auto mb-3" />
                            <p className="text-text-secondary font-medium">Nenhum favorito selecionado.</p>
                        </div>
                    )}
                </div>
            ) : (
                // Interactive View
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={(e) => setActiveId(e.active.id)}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 relative z-10">
                        <SortableContext items={localItems.map(i => i.id)} strategy={rectSortingStrategy}>
                            {localItems.map((item) => (
                                <SortableFavoriteItem key={item.id} item={item} type={type} isEditing={isEditing} />
                            ))}
                        </SortableContext>

                        {/* Empty Slots */}
                        {Array.from({ length: 6 - localItems.length }).map((_, i) => (
                            <div
                                key={`empty-${i}`}
                                className="aspect-[2/3] rounded-xl border-2 border-dashed border-border-color bg-bg-tertiary/30 flex flex-col items-center justify-center gap-3 text-text-secondary/50 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
                            >
                                <div className="p-3 rounded-full bg-bg-tertiary group-hover:scale-110 transition-transform shadow-sm">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-70">Vazio</span>
                            </div>
                        ))}
                    </div>

                    <DragOverlay adjustScale={true}>
                        {activeId ? (
                            <FavoriteCard
                                item={localItems.find(i => i.id === activeId)}
                                type={type}
                                isOverlay
                                isEditing
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    );
}
