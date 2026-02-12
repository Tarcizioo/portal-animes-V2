import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, Clock, Tv, Star, Heart, TrendingUp, Calendar, ChevronDown, ChevronUp, Cloud, Monitor, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

import { useAnimeLibrary } from '@/hooks/useAnimeLibrary';

import { useAnimeStats, calculateGenreStats, calculateScoreDistribution } from '@/hooks/useAnimeStats';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Loader } from '@/components/ui/Loader';
import { X } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export function Stats() {
    usePageTitle('Estatísticas');
    const { library, loading } = useAnimeLibrary();
    const stats = useAnimeStats(library);
    const [showAllGenres, setShowAllGenres] = useState(false);
    const [sortBy, setSortBy] = useState('count'); // count, score, time, percentage
    const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

    // --- Filters ---
    const [selectedYear, setSelectedYear] = useState('All');
    const [selectedSeason, setSelectedSeason] = useState('All');
    const [selectedFormat, setSelectedFormat] = useState('All');

    // Extract Options
    const extractOptions = (field) => {
        const options = new Set(library.map(anime => anime[field]).filter(Boolean));
        return ['All', ...Array.from(options).sort((a, b) => b - a)]; // Descending for years
    };

    const years = useMemo(() => extractOptions('year'), [library]);
    const seasons = ['All', 'Winter', 'Spring', 'Summer', 'Fall']; // Fixed standard seasons
    const formats = useMemo(() => extractOptions('type'), [library]);

    // Calculate Filtered Genres
    const filteredGenresRaw = useMemo(() => {
        let filtered = library;

        if (selectedYear !== 'All') filtered = filtered.filter(a => a.year === parseInt(selectedYear) || a.year === selectedYear); // Handle string/int
        if (selectedSeason !== 'All') filtered = filtered.filter(a => a.season && a.season.toLowerCase() === selectedSeason.toLowerCase());
        if (selectedFormat !== 'All') filtered = filtered.filter(a => a.type === selectedFormat);

        return calculateGenreStats(filtered);
    }, [library, selectedYear, selectedSeason, selectedFormat]);

    // --- Score Filters (Modal) ---
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [scoreYear, setScoreYear] = useState('All');
    const [scoreSeason, setScoreSeason] = useState('All');
    const [scoreFormat, setScoreFormat] = useState('All');

    const filteredScores = useMemo(() => {
         let filtered = library;

        if (scoreYear !== 'All') filtered = filtered.filter(a => a.year === parseInt(scoreYear) || a.year === scoreYear);
        if (scoreSeason !== 'All') filtered = filtered.filter(a => a.season && a.season.toLowerCase() === scoreSeason.toLowerCase());
        if (scoreFormat !== 'All') filtered = filtered.filter(a => a.type === scoreFormat);

        return calculateScoreDistribution(filtered);
    }, [library, scoreYear, scoreSeason, scoreFormat]);



    const handleSort = (criteria) => {
        if (sortBy === criteria) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(criteria);
            setSortOrder('desc');
        }
    };

    const sortedGenres = [...filteredGenresRaw].sort((a, b) => {
        let valA = a.total;
        let valB = b.total;

        if (sortBy === 'score') { valA = a.averageScore; valB = b.averageScore; }
        if (sortBy === 'time') { valA = a.daysWatched; valB = b.daysWatched; }
        if (sortBy === 'percentage') { valA = a.percentage; valB = b.percentage; }
        
        return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    const displayedGenres = showAllGenres ? sortedGenres : sortedGenres.slice(0, 8);

    // Custom Tooltip for Recharts to match theme
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-bg-secondary border border-border-color p-3 rounded-lg shadow-xl">
                    <p className="font-bold text-text-primary mb-1">{label}</p>
                    <p className="text-sm text-primary">
                        {payload[0].value} {payload[0].name === 'count' ? 'Animes' : ''}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Lock body scroll when modal is open
    useEffect(() => {
        if (showScoreModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showScoreModal]);

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

    if (!library || library.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <BarChart3 className="w-16 h-16 text-text-secondary mb-4 opacity-50" />
                <h2 className="text-2xl font-bold text-text-primary mb-2">Sem dados suficientes</h2>
                <p className="text-text-secondary max-w-md">
                    Adicione animes à sua biblioteca para ver suas estatísticas detalhadas aqui.
                </p>
            </div>
        );
    }



    return (
        <div className="p-4 md:p-6 lg:p-10 space-y-6 md:space-y-8 max-w-[1600px] mx-auto pb-24">
            <header>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-2 md:gap-3">
                    <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    Estatísticas
                </h1>
                <p className="text-xs md:text-sm text-text-secondary mt-1">Análise detalhada do seu progresso</p>
            </header>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                    icon={Tv} 
                    label="Total Animes" 
                    value={stats.overview.totalAnimes} 
                    color="text-blue-500" 
                    bg="bg-blue-500/10"
                />
                <StatCard 
                    icon={Clock} 
                    label="Tempo Assistido" 
                    value={`${stats.overview.totalDays} dias`} 
                    subValue={`${stats.overview.totalHours} horas`}
                    color="text-purple-500" 
                    bg="bg-purple-500/10"
                />
                <StatCard 
                    icon={Star} 
                    label="Nota Média" 
                    value={stats.overview.averageScore} 
                    color="text-yellow-500" 
                    bg="bg-yellow-500/10"
                />
                <StatCard 
                    icon={Heart} 
                    label="Favoritos" 
                    value={stats.overview.favoritesCount} 
                    color="text-red-500" 
                    bg="bg-red-500/10"
                />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Status Distribution */}
                <ChartCard title="Status da Biblioteca">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.status}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {stats.status.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Score Distribution */}
                <ChartCard 
                    title="Distribuição de Notas"
                    rightElement={
                         <button 
                            onClick={() => setShowScoreModal(true)}
                            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                        >
                            Ver Detalhes <ChevronDown className="w-4 h-4" />
                        </button>
                    }
                >
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.scoreDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                                <XAxis dataKey="score" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<ScoreTooltip />} cursor={{fill: 'transparent'}} />
                                <Legend />
                                <Bar dataKey="watching" name="Assistindo" stackId="a" fill="#3b82f6" />
                                <Bar dataKey="completed" name="Completo" stackId="a" fill="#10b981" />
                                <Bar dataKey="plan_to_watch" name="Planejado" stackId="a" fill="#6366f1" />
                                <Bar dataKey="paused" name="Pausado" stackId="a" fill="#f59e0b" />
                                <Bar dataKey="dropped" name="Dropado" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Types Distribution */}
                 <ChartCard title="Formatos de Anime">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.types}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {stats.types.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Top Rated List (Moved Up) */}
                <div className="bg-bg-secondary rounded-2xl border border-border-color p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Top Avaliados por Você
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.topRated.slice(0, 6).map((anime, index) => (
                            <div key={anime.id} className="flex gap-3 bg-bg-tertiary/50 p-3 rounded-xl border border-border-color items-center">
                                <div className="relative w-12 h-16 flex-shrink-0 rounded-md overflow-hidden">
                                    <img src={anime.image} alt={anime.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-0 left-0 bg-black/60 px-1 rounded-br text-[10px] font-bold text-white">
                                        #{index + 1}
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-text-primary text-sm truncate">{anime.title}</h4>
                                    <div className="flex items-center gap-1 text-xs text-text-secondary mt-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        <span className="font-bold text-text-primary">{anime.score}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

                {/* Top Genres (Detailed List) */}
                <ChartCard 
                    title="Gêneros/Temas Detalhados" 
                    rightElement={
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                            {/* Filters */}
                            <div className="flex items-center gap-2">
                                <FilterDropdown 
                                    icon={<Calendar className="w-3 h-3" />} 
                                    label="Ano" 
                                    value={selectedYear} 
                                    options={years} 
                                    onChange={setSelectedYear} 
                                />
                                <FilterDropdown 
                                    icon={<Cloud className="w-3 h-3" />} 
                                    label="Season" 
                                    value={selectedSeason} 
                                    options={seasons} 
                                    onChange={setSelectedSeason} 
                                />
                                <FilterDropdown 
                                    icon={<Monitor className="w-3 h-3" />} 
                                    label="Formato" 
                                    value={selectedFormat} 
                                    options={formats} 
                                    onChange={setSelectedFormat} 
                                />
                            </div>

                            {sortedGenres.length > 8 && (
                                <button 
                                    onClick={() => setShowAllGenres(!showAllGenres)}
                                    className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors whitespace-nowrap"
                                >
                                    {showAllGenres ? (
                                        <>Ver Menos <ChevronUp className="w-4 h-4" /></>
                                    ) : (
                                        <>Ver Todos ({sortedGenres.length}) <ChevronDown className="w-4 h-4" /></>
                                    )}
                                </button>
                            )}
                        </div>
                    }
                >
                    <div className="w-full text-left border-collapse min-w-[300px]">
                        {/* Headers */}
                        <div className="grid grid-cols-12 gap-2 text-[10px] md:text-xs font-bold text-text-secondary uppercase select-none mb-3 px-2">
                            <div className="col-span-5 md:col-span-4 flex items-center gap-1 cursor-pointer hover:text-primary transition-colors truncate" onClick={() => handleSort('count')}>
                                Gênero
                                {sortBy === 'count' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 flex-shrink-0" /> : <ChevronDown className="w-3 h-3 flex-shrink-0" />)}
                            </div>
                            <div className="col-span-2 md:col-span-2 text-right cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('percentage')}>
                                <div className="flex items-center justify-end gap-1">
                                    %
                                    {sortBy === 'percentage' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 flex-shrink-0" /> : <ChevronDown className="w-3 h-3 flex-shrink-0" />)}
                                </div>
                            </div>
                            <div className="col-span-2 md:col-span-3 text-right cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('score')}> 
                                <div className="flex items-center justify-end gap-1">
                                    Nota
                                    {sortBy === 'score' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 flex-shrink-0" /> : <ChevronDown className="w-3 h-3 flex-shrink-0" />)}
                                </div>
                            </div>
                            <div className="col-span-3 md:col-span-3 text-right cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('time')}>
                                <div className="flex items-center justify-end gap-1">
                                    Tempo
                                    {sortBy === 'time' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 flex-shrink-0" /> : <ChevronDown className="w-3 h-3 flex-shrink-0" />)}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <AnimatePresence>
                                {displayedGenres.map((genre) => (
                                    <GenreRow key={genre.name} genre={genre} totalLibraryAnimes={stats.overview.totalAnimes} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </ChartCard>
        {/* Score Modal */}
        {/* Score Modal */}
        {createPortal(
            <AnimatePresence>
                {showScoreModal && (
                    <div className="fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="bg-bg-secondary w-full md:max-w-4xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto rounded-none md:rounded-2xl border-none md:border border-border-color shadow-2xl relative flex flex-col"
                        >
                             <div className="sticky top-0 z-10 flex items-center justify-between p-4 md:p-6 border-b border-border-color bg-bg-secondary/95 backdrop-blur-sm shrink-0">
                                <div>
                                    <h2 className="text-lg md:text-xl font-bold text-text-primary">Distribuição de Notas</h2>
                                    <p className="text-xs md:text-sm text-text-secondary">Analise suas notas com filtros específicos</p>
                                </div>
                                <button 
                                    onClick={() => setShowScoreModal(false)}
                                    className="p-2 rounded-full hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Controls */}
                                <div className="flex flex-wrap items-center gap-4 bg-bg-tertiary/50 p-4 rounded-xl border border-border-color">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-bold text-text-primary">Filtros:</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <FilterDropdown 
                                            icon={<Calendar className="w-3 h-3" />} 
                                            label="Ano" 
                                            value={scoreYear} 
                                            options={years} 
                                            onChange={setScoreYear} 
                                        />
                                        <FilterDropdown 
                                            icon={<Cloud className="w-3 h-3" />} 
                                            label="Season" 
                                            value={scoreSeason} 
                                            options={seasons} 
                                            onChange={setScoreSeason} 
                                        />
                                        <FilterDropdown 
                                            icon={<Monitor className="w-3 h-3" />} 
                                            label="Formato" 
                                            value={scoreFormat} 
                                            options={formats} 
                                            onChange={setScoreFormat} 
                                        />
                                    </div>
                                </div>

                                {/* Main Chart */}
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={filteredScores} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                                            <XAxis dataKey="score" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} width={20} />
                                            <Tooltip content={<ScoreTooltip />} cursor={{fill: 'transparent'}} />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            <Bar dataKey="watching" name="Assistindo" stackId="a" fill="#3b82f6" />
                                            <Bar dataKey="completed" name="Completo" stackId="a" fill="#10b981" />
                                            <Bar dataKey="plan_to_watch" name="Planejado" stackId="a" fill="#6366f1" />
                                            <Bar dataKey="paused" name="Pausado" stackId="a" fill="#f59e0b" />
                                            <Bar dataKey="dropped" name="Dropado" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                
                                {/* Detailed List */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {filteredScores.slice().reverse().map((scoreData) => (
                                        <div key={scoreData.score} className="bg-bg-tertiary p-4 rounded-xl border border-border-color">
                                            <div className="flex items-center justify-between mb-3 border-b border-border-color pb-2">
                                                <span className="text-lg font-bold text-text-primary flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                    {scoreData.score}
                                                </span>
                                                <span className="text-xs font-bold text-text-secondary bg-bg-secondary px-2 py-1 rounded-md">
                                                    {scoreData.total} animes
                                                </span>
                                            </div>
                                            <div className="space-y-1.5">
                                                {scoreData.watching > 0 && <StatusRow label="Assistindo" count={scoreData.watching} color="bg-blue-500" />}
                                                {scoreData.completed > 0 && <StatusRow label="Completo" count={scoreData.completed} color="bg-emerald-500" />}
                                                {scoreData.plan_to_watch > 0 && <StatusRow label="Planejado" count={scoreData.plan_to_watch} color="bg-indigo-500" />}
                                                {scoreData.paused > 0 && <StatusRow label="Pausado" count={scoreData.paused} color="bg-amber-500" />}
                                                {scoreData.dropped > 0 && <StatusRow label="Dropado" count={scoreData.dropped} color="bg-red-500" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>,
            document.body
        )}
        </div>


    );
}

function GenreRow({ genre, totalLibraryAnimes }) {
    const [showTooltip, setShowTooltip] = useState(false);

    // Calculate width relative to the genre total itself for the stacked bars to fill 100% of the bar width?
    // Wait, the progress bar usually represents "this genre vs total library".
    // If I use (watching / genre.total), the stacked bar will always be full width (100%).
    // The previous logic was (watching / totalAnimes).
    // The user wants visualization.
    // IF the bar width is calculated as (genre.total / totalLibraryAnimes), then inside that bar, 
    // the segments should sum up to 100% OF THAT BAR.
    // So yes, inside the bar, use (count / genre.total).

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-12 gap-2 p-2 rounded-lg hover:bg-bg-tertiary transition-colors items-center group relative text-left"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* Tooltip ... */}
            <AnimatePresence>
                {showTooltip && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 bottom-full mb-2 z-50 bg-bg-secondary border border-border-color p-3 rounded-xl shadow-xl min-w-[180px]"
                    >
                        <p className="font-bold text-text-primary mb-2 border-b border-border-color pb-1 text-xs">{genre.name}</p>
                        <div className="space-y-1">
                            {genre.watching > 0 && <StatusRow label="Assistindo" count={genre.watching} color="bg-blue-500" />}
                            {genre.completed > 0 && <StatusRow label="Completo" count={genre.completed} color="bg-emerald-500" />}
                            {genre.plan_to_watch > 0 && <StatusRow label="Planejado" count={genre.plan_to_watch} color="bg-indigo-500" />}
                            {genre.paused > 0 && <StatusRow label="Pausado" count={genre.paused} color="bg-amber-500" />}
                            {genre.dropped > 0 && <StatusRow label="Dropado" count={genre.dropped} color="bg-red-500" />}
                        </div>
                        <div className="mt-2 pt-1 border-t border-border-color flex justify-between text-xs font-bold text-text-primary">
                            <span>Total</span>
                            <span>{genre.total}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Name & Progress Bar */}
            <div className="col-span-5 md:col-span-4 relative z-10 text-left">
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm text-text-primary truncate" title={genre.name}>
                        {genre.name}
                    </span>
                    <div className="w-full bg-bg-primary h-2 rounded-full overflow-hidden flex relative">
                        {/* Default Bar (Primary Color) - Visible ONLY when NOT hovering */}
                        <div 
                            className="h-full bg-primary absolute top-0 left-0 transition-opacity duration-300 group-hover:opacity-0" 
                            style={{ width: `${(genre.total / (totalLibraryAnimes > 0 ? totalLibraryAnimes : 1)) * 100}%` }} 
                        />
                        
                        {/* Stacked Bars (Status Colors) - Visible ONLY on Hover */}
                        <div className="flex w-full h-full">
                            {genre.watching > 0 && <div style={{ width: `${(genre.watching / genre.total) * 100}%` }} className="h-full bg-blue-500" />}
                            {genre.completed > 0 && <div style={{ width: `${(genre.completed / genre.total) * 100}%` }} className="h-full bg-emerald-500" />}
                            {genre.plan_to_watch > 0 && <div style={{ width: `${(genre.plan_to_watch / genre.total) * 100}%` }} className="h-full bg-indigo-500" />}
                            {genre.paused > 0 && <div style={{ width: `${(genre.paused / genre.total) * 100}%` }} className="h-full bg-amber-500" />}
                            {genre.dropped > 0 && <div style={{ width: `${(genre.dropped / genre.total) * 100}%` }} className="h-full bg-red-500" />}
                        </div>
                    </div>
                    <span className="text-[10px] text-text-secondary group-hover:text-text-primary transition-colors">
                        {genre.total} animes
                    </span>
                </div>
            </div>
            {/* ... other columns ... */}
            {/* Percentage */}
            <div className="col-span-2 md:col-span-2 flex items-center justify-end font-medium text-text-secondary text-xs md:text-sm z-10">
                {genre.percentage}%
            </div>

            {/* Avg Score */}
            <div className="col-span-2 md:col-span-3 flex items-center justify-end gap-1 font-bold text-text-primary text-xs md:text-sm z-10">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                {genre.averageScore > 0 ? genre.averageScore : '-'}
            </div>

            {/* Days Watched */}
            <div className="col-span-3 md:col-span-3 flex items-center justify-end font-medium text-text-secondary text-xs md:text-sm z-10">
                {genre.daysWatched > 0 ? `${genre.daysWatched}d` : '-'}
            </div>
        </motion.div>
    );

}

function FilterDropdown({ icon, label, value, options, onChange }) {
    return (
        <div className="relative group">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none bg-bg-tertiary border border-border-color text-text-secondary text-[10px] font-bold py-1 pl-2 pr-6 rounded-md cursor-pointer hover:border-primary focus:outline-none focus:border-primary transition-colors w-full sm:w-auto"
            >
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                {/* {icon} Arrow icon */}
                <ChevronDown className="w-3 h-3" />
            </div>
        </div>
    );
}

function StatusRow({ label, count, color }) {
    return (
        <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-text-secondary">{label}</span>
            </div>
            <span className="font-bold text-text-primary">{count}</span>
        </div>
    );
}

function ScoreTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-bg-secondary border border-border-color p-3 rounded-lg shadow-xl min-w-[150px]">
                <p className="font-bold text-text-primary mb-2 border-b border-border-color pb-1">Nota {label}</p>
                {payload.map((entry, index) => (
                    entry.value > 0 && (
                        <div key={index} className="flex items-center justify-between gap-3 text-xs mb-1 last:mb-0">
                            <span className="flex items-center gap-1 text-text-secondary">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name}
                            </span>
                            <span className="font-bold text-text-primary">{entry.value}</span>
                        </div>
                    )
                ))}
                <div className="mt-2 pt-1 border-t border-border-color flex justify-between text-xs font-bold text-text-primary">
                    <span>Total</span>
                    <span>{payload.reduce((acc, curr) => acc + Number(curr.value), 0)}</span>
                </div>
            </div>
        );
    }
    return null;
}

function StatCard({ icon: Icon, label, value, subValue, color, bg }) {
    return (
        <div className="bg-bg-secondary p-5 rounded-2xl border border-border-color flex items-center gap-4">
            <div className={`p-3 rounded-xl ${bg} ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-text-secondary font-medium">{label}</p>
                <h3 className="text-2xl font-bold text-text-primary">{value}</h3>
                {subValue && <p className="text-xs text-text-secondary mt-0.5">{subValue}</p>}
            </div>
        </div>
    );
}

function ChartCard({ title, children, rightElement }) {
    return (
        <div className="bg-bg-secondary p-6 rounded-2xl border border-border-color shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text-primary">{title}</h3>
                {rightElement}
            </div>
            {children}
        </div>
    );
}
