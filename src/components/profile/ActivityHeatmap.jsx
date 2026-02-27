import { useMemo, useRef, useEffect, useState } from 'react';

// ── Date helpers ──────────────────────────────────────────────────────────────

function toKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
// Sun=0 … Sat=6 labels (left axis)
const WEEKDAY_LABELS = ['Dom', '', 'Ter', '', 'Qui', '', 'Sáb'];

/**
 * Build a calendar aligned to real weeks (Sun→Sat).
 * Returns an array of 7-element arrays (columns = weeks).
 * Entries can be a Date or null (gap padding before first real day, or future).
 */
function buildWeeks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start of the week (Sunday) that was ≈ 52 weeks ago
    const startDay = new Date(today);
    startDay.setDate(today.getDate() - 52 * 7 + 1);          // 52 weeks back
    startDay.setDate(startDay.getDate() - startDay.getDay()); // rewind to Sunday

    const weeks = [];
    const cursor = new Date(startDay);

    while (cursor <= today) {
        const week = [];
        for (let d = 0; d < 7; d++) {
            const day = new Date(cursor);
            // null = future day (rest of the final week after today)
            week.push(day <= today ? day : null);
            cursor.setDate(cursor.getDate() + 1);
        }
        weeks.push(week);
    }

    return weeks;
}

/** Heatmap level (0‒4) */
function level(count) {
    if (!count || count === 0) return 0;
    if (count <= 2)  return 1;
    if (count <= 5)  return 2;
    if (count <= 9)  return 3;
    return 4;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {{ activityLog?: Record<string, number> }} props
 */
export function ActivityHeatmap({ activityLog = {} }) {
    const weeks = useMemo(() => buildWeeks(), []);

    const totalEps = useMemo(
        () => Object.values(activityLog).reduce((s, v) => s + v, 0),
        [activityLog]
    );

    // Build month labels: show a month name above the first week that contains the 1st
    const monthLabels = useMemo(() => {
        return weeks.map((week, wi) => {
            const firstReal = week.find(d => d !== null);
            if (!firstReal) return null;
            if (firstReal.getDate() <= 7) return { wi, name: MONTH_NAMES[firstReal.getMonth()] };
            return null;
        }).filter(Boolean);
    }, [weeks]);

    // ── Responsive cell size: measure container, then compute ─────────────────
    const wrapRef = useRef(null);
    const [cellSize, setCellSize] = useState(12);
    const GAP = 3;

    useEffect(() => {
        if (!wrapRef.current) return;
        const compute = () => {
            const available = wrapRef.current.clientWidth - 30; // 30px for day-labels
            const size = Math.floor((available - GAP * (weeks.length - 1)) / weeks.length);
            setCellSize(Math.max(8, Math.min(14, size)));
        };
        compute();
        const ro = new ResizeObserver(compute);
        ro.observe(wrapRef.current);
        return () => ro.disconnect();
    }, [weeks.length]);

    const STEP = cellSize + GAP;

    return (
        <div className="bg-bg-secondary border border-border-color rounded-2xl p-5 md:p-6 select-none">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-primary text-sm md:text-base flex items-center gap-2">
                    <span>🗓️</span> Atividade de Episódios
                </h3>
                <span className="text-xs text-text-secondary font-medium">
                    {totalEps} eps nos últimos 12 meses
                </span>
            </div>

            <div ref={wrapRef} className="w-full">
                <div style={{ display: 'flex', gap: 0, width: '100%', alignItems: 'flex-start' }}>

                    {/* Weekday labels (left) */}
                    <div style={{
                        display: 'flex', flexDirection: 'column', gap: GAP,
                        marginRight: GAP + 2, paddingTop: 20, flexShrink: 0,
                        width: 26,
                    }}>
                        {WEEKDAY_LABELS.map((l, i) => (
                            <div key={i} style={{
                                height: cellSize, lineHeight: `${cellSize}px`,
                                fontSize: 9, color: 'var(--text-secondary)',
                                textAlign: 'right',
                            }}>
                                {l}
                            </div>
                        ))}
                    </div>

                    {/* Grid area */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Month labels */}
                        <div style={{ position: 'relative', height: 20, marginBottom: 2 }}>
                            {monthLabels.map((m, i) => (
                                <span key={i} style={{
                                    position: 'absolute',
                                    left: m.wi * STEP,
                                    fontSize: 10,
                                    color: 'var(--text-secondary)',
                                    lineHeight: '20px',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {m.name}
                                </span>
                            ))}
                        </div>

                        {/* Week columns — flex row, each col = flex column of 7 cells */}
                        <div style={{ display: 'flex', gap: GAP }}>
                            {weeks.map((week, wi) => (
                                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP, flex: '1 1 0' }}>
                                    {week.map((day, di) => {
                                        if (day === null) {
                                            // future padding — transparent placeholder
                                            return (
                                                <div key={di} style={{ height: cellSize, borderRadius: 3 }} />
                                            );
                                        }
                                        const key   = toKey(day);
                                        const count = activityLog[key] || 0;
                                        const lv    = level(count);
                                        const label = count
                                            ? `${count} ep${count > 1 ? 's' : ''} assistido${count > 1 ? 's' : ''} em ${day.toLocaleDateString('pt-BR')}`
                                            : `Nenhuma atividade em ${day.toLocaleDateString('pt-BR')}`;
                                        return (
                                            <div
                                                key={di}
                                                title={label}
                                                style={{
                                                    height: cellSize,
                                                    borderRadius: 3,
                                                    backgroundColor: `var(--heatmap-${lv})`,
                                                    border: lv > 0
                                                        ? '1px solid color-mix(in srgb, var(--button-accent) 40%, transparent)'
                                                        : '1px solid rgba(255,255,255,0.05)',
                                                    transition: 'opacity 0.15s',
                                                    cursor: 'default',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 justify-end">
                <span className="text-[10px] text-text-secondary">Menos</span>
                {[0, 1, 2, 3, 4].map(l => (
                    <div key={l} style={{
                        width: 12, height: 12, borderRadius: 3,
                        backgroundColor: `var(--heatmap-${l})`,
                        border: l > 0
                            ? '1px solid color-mix(in srgb, var(--button-accent) 40%, transparent)'
                            : '1px solid rgba(255,255,255,0.05)',
                    }} />
                ))}
                <span className="text-[10px] text-text-secondary">Mais</span>
            </div>
        </div>
    );
}
