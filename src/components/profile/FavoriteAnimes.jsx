import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, GripVertical } from 'lucide-react';
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

// Card visual isolado para reutilização no overlay
function FavoriteCard({ anime, isOverlay = false, dragListeners = {}, dragAttributes = {} }) {
    return (
        <div className={`relative aspect-[3/4] rounded-xl overflow-hidden bg-bg-tertiary border border-border-color shadow-lg group ${isOverlay ? 'cursor-grabbing scale-105 shadow-2xl ring-2 ring-primary z-50' : ''}`}>
            {/* Drag Handle */}
            <div
                {...dragListeners}
                {...dragAttributes}
                className="absolute top-2 left-2 z-20 p-1.5 bg-black/50 hover:bg-black/70 rounded-lg cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <GripVertical className="w-4 h-4 text-white" />
            </div>

            <Link
                to={`/anime/${anime.id}`}
                className="block w-full h-full"
                draggable={false} // Impede drag nativo no link
            >
                <img
                    src={anime.image}
                    alt={anime.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-3 w-full">
                    <h4 className="text-white text-sm font-bold line-clamp-2 leading-tight drop-shadow-md">
                        {anime.title}
                    </h4>
                </div>
                {/* Badge de TOP */}
                <div className="absolute top-2 right-2">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500 drop-shadow-lg" />
                </div>
            </Link>
        </div>
    );
}

// Wrapper Sortable
function SortableFavoriteItem({ anime }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: anime.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="touch-none">
            <FavoriteCard anime={anime} dragListeners={listeners} dragAttributes={attributes} />
        </div>
    );
}

export function FavoriteAnimes({ favorites, onReorder }) {
    const [items, setItems] = useState(favorites);
    const [activeId, setActiveId] = useState(null);

    useEffect(() => {
        setItems(favorites);
    }, [favorites]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Previne clique acidental ao clicar normal
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Propagar mudança para o pai
                if (onReorder) {
                    onReorder(newOrder.map(item => item.id));
                }

                return newOrder;
            });
        }
        setActiveId(null);
    };

    return (
        <div className="bg-bg-secondary border border-border-color rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-text-primary flex items-center gap-2 text-lg">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Animes Favoritos
                </h3>
                <span className="text-xs font-bold bg-bg-tertiary text-text-secondary px-2 py-1 rounded-md">
                    {items.length} / 3
                </span>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
                        {items.map((anime) => (
                            <SortableFavoriteItem key={anime.id} anime={anime} />
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
                            anime={items.find(item => item.id === activeId)}
                            isOverlay
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
