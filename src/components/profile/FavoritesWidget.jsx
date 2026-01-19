import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, GripVertical, User, Pin, PinOff } from 'lucide-react';
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

// --- Components Helpers ---

function FavoriteCard({ item, type, isOverlay = false, dragListeners = {}, dragAttributes = {} }) {
    const linkPath = type === 'anime' ? `/anime/${item.id}` : `/character/${item.id}`;

    return (
        <div className={`relative aspect-[3/4] rounded-xl overflow-hidden bg-bg-tertiary border border-border-color shadow-lg group ${isOverlay ? 'cursor-grabbing scale-105 shadow-2xl ring-2 ring-primary z-50' : ''}`}>
            {/* Drag Handle */}
            <div
                {...dragListeners}
                {...dragAttributes}
                className="absolute top-2 left-2 z-20 p-1.5 bg-black/50 hover:bg-black/70 rounded-lg cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity touch-none"
            >
                <GripVertical className="w-4 h-4 text-white" />
            </div>

            <Link
                to={linkPath}
                className="block w-full h-full"
                draggable={false}
            >
                <img
                    src={item.image}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-3 w-full">
                    <h4 className="text-white text-sm font-bold line-clamp-2 leading-tight drop-shadow-md">
                        {item.title || item.name}
                    </h4>
                </div>
                {/* Badge de TOP / Icon (Optional) */}
                <div className="absolute top-2 right-2">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500 drop-shadow-lg" />
                </div>
            </Link>
        </div>
    );
}

function SortableFavoriteItem({ item, type }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="touch-none">
            <FavoriteCard item={item} type={type} dragListeners={listeners} dragAttributes={attributes} />
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
    onSetPreferredView
}) {
    // Determine initial active tab based on saved preference or default to 'anime'
    const [activeTab, setActiveTab] = useState(preferredView || 'anime');

    // Sync if preference updates externally
    useEffect(() => {
        if (preferredView) setActiveTab(preferredView);
    }, [preferredView]);

    const isPinned = preferredView === activeTab;

    const items = activeTab === 'anime' ? animeFavorites : characterFavorites;
    const type = activeTab; // 'anime' or 'character'

    // Dnd State
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            const newOrder = arrayMove(items, oldIndex, newIndex);

            const newOrderIds = newOrder.map(item => item.id);
            if (activeTab === 'anime') {
                onReorderAnimes(newOrderIds);
            } else {
                onReorderCharacters(newOrderIds);
            }
        }
        setActiveId(null);
    };

    const handlePin = () => {
        if (isPinned) {
            // Unpin (set to null or keep logic? User said "fixar qual ele quer manter". So unpin implies no specific preference? or maybe just toggle?)
            // If currently pinned, maybe unsetting it? But user likely wants to SWITCH pin.
            // If I click PIN on the ACTIVE tab, it sets it as preference.
            // If it is ALREADY pinned, maybe I can un-pin (clear preference)?
            onSetPreferredView(null);
        } else {
            onSetPreferredView(activeTab);
        }
    };

    return (
        <div className="bg-bg-secondary border border-border-color rounded-2xl p-6 relative">

            {/* Header com Abas e Pin */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

                <div className="flex items-center gap-4">
                    {/* Tabs Switcher */}
                    <div className="flex bg-bg-tertiary/50 p-1 rounded-xl border border-border-color">
                        <button
                            onClick={() => setActiveTab('anime')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'anime'
                                    ? 'bg-bg-secondary text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            <Heart className={`w-4 h-4 ${activeTab === 'anime' ? 'fill-primary' : ''}`} />
                            Animes
                        </button>
                        <button
                            onClick={() => setActiveTab('character')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'character'
                                    ? 'bg-bg-secondary text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            <User className={`w-4 h-4 ${activeTab === 'character' ? 'fill-primary' : ''}`} />
                            Personagens
                        </button>
                    </div>

                    {/* Counter */}
                    <span className="text-xs font-bold bg-bg-tertiary text-text-secondary px-2 py-1 rounded-md hidden sm:block">
                        {items.length} / 3
                    </span>
                </div>

                {/* Pin Action */}
                <button
                    onClick={handlePin}
                    className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${isPinned
                            ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                            : 'bg-transparent text-text-secondary border-transparent hover:bg-bg-tertiary'
                        }`}
                    title={isPinned ? "Desfixar visão padrão" : "Fixar esta visão como padrão"}
                >
                    {isPinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <Pin className="w-3.5 h-3.5" />}
                    {isPinned ? 'Fixado' : 'Fixar no Perfil'}
                </button>
            </div>

            {/* Content Area (DND) */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={(e) => setActiveId(e.active.id)}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
                        {items.map((item) => (
                            <SortableFavoriteItem key={item.id} item={item} type={type} />
                        ))}
                    </SortableContext>

                    {/* Slots Vazios */}
                    {Array.from({ length: 3 - items.length }).map((_, i) => (
                        <div
                            key={`empty-${i}`}
                            className="aspect-[3/4] rounded-xl border-2 border-dashed border-border-color bg-bg-tertiary/30 flex flex-col items-center justify-center gap-2 text-text-secondary hover:border-text-secondary/50 transition-colors group cursor-default"
                        >
                            <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus className="w-5 h-5 opacity-50" />
                            </div>
                            <span className="text-xs font-medium opacity-50">Vazio</span>
                        </div>
                    ))}
                </div>

                <DragOverlay adjustScale={true}>
                    {activeId ? (
                        <FavoriteCard
                            item={items.find(i => i.id === activeId)}
                            type={type}
                            isOverlay
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
