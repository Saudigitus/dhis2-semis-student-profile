import {
    FunctionComponent,
    useMemo,
    useState,
    useId,
    KeyboardEvent,
} from "react";
import styles from "./charts.module.css";

export interface DonutSegment {
    label: string;
    value: number;
    color?: string;
}

export interface DonutChartProps {
    segments: DonutSegment[];
    size?: number;
    outerRadius?: number;
    innerRadius?: number;
    showLegend?: boolean;
    className?: string;
    ariaLabel?: string;
    /** NEW — opt-in enhancements, default to sensible "on" behavior */
    showTooltip?: boolean;
    animate?: boolean;
    showCenterTotal?: boolean;
    centerLabel?: string;
    formatValue?: (value: number) => string;
    onSegmentHover?: (segment: DonutSegment | null, index: number) => void;
}

const DEFAULT_COLORS = [
    "#2963a3",
    "#e74c3c",
    "#2ecc71",
    "#f39c12",
    "#9b59b6",
    "#1abc9c",
    "#34495e",
    "#e67e22",
];

const defaultFormatValue = (v: number) => `${v}`;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
        x: cx + r * Math.cos(angleRad),
        y: cy + r * Math.sin(angleRad),
    };
}

function buildRingPath(
    cx: number,
    cy: number,
    outerR: number,
    innerR: number,
    startAngle: number,
    endAngle: number,
): string {
    if (endAngle - startAngle <= 0.001) return "";
    const isFullCircle = Math.abs(endAngle - startAngle - 360) < 0.001;
    if (isFullCircle) {
        const outerStart = polarToCartesian(cx, cy, outerR, 0.001);
        const outerMid = polarToCartesian(cx, cy, outerR, 180);
        const outerEnd = polarToCartesian(cx, cy, outerR, 359.999);
        const innerStart = polarToCartesian(cx, cy, innerR, 359.999);
        const innerMid = polarToCartesian(cx, cy, innerR, 180);
        const innerEnd = polarToCartesian(cx, cy, innerR, 0.001);
        return [
            "M", outerStart.x, outerStart.y,
            "A", outerR, outerR, 0, 0, 1, outerMid.x, outerMid.y,
            "A", outerR, outerR, 0, 0, 1, outerEnd.x, outerEnd.y,
            "L", innerStart.x, innerStart.y,
            "A", innerR, innerR, 0, 0, 0, innerMid.x, innerMid.y,
            "A", innerR, innerR, 0, 0, 0, innerEnd.x, innerEnd.y,
            "Z",
        ].join(" ");
    }
    const outerStart = polarToCartesian(cx, cy, outerR, endAngle);
    const outerEnd = polarToCartesian(cx, cy, outerR, startAngle);
    const innerStart = polarToCartesian(cx, cy, innerR, startAngle);
    const innerEnd = polarToCartesian(cx, cy, innerR, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return [
        "M", outerStart.x, outerStart.y,
        "A", outerR, outerR, 0, largeArc, 0, outerEnd.x, outerEnd.y,
        "L", innerStart.x, innerStart.y,
        "A", innerR, innerR, 0, largeArc, 1, innerEnd.x, innerEnd.y,
        "Z",
    ].join(" ");
}

/** Midpoint angle of a segment, used to push a hovered wedge outward along its own radial line. */
function midAngle(startAngle: number, endAngle: number) {
    return (startAngle + endAngle) / 2;
}

const DonutChart: FunctionComponent<DonutChartProps> = (props) => {
    const {
        segments,
        size = 200,
        outerRadius,
        innerRadius,
        showLegend = true,
        className,
        ariaLabel,
        showTooltip = true,
        animate = true,
        showCenterTotal = false,
        centerLabel = "Total",
        formatValue = defaultFormatValue,
        onSegmentHover,
    } = props;

    const uid = useId();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const cx = size / 2;
    const cy = size / 2;
    const outerR = outerRadius ?? Math.floor(size * 0.425);
    const innerR = innerRadius ?? Math.floor(size * 0.25);
    const hoverOffset = Math.max(4, Math.floor(size * 0.03));

    const viewBox = `0 0 ${size} ${size}`;

    const normalized = useMemo(() => {
        const totalRaw = segments.reduce((s, seg) => s + Math.max(0, seg.value), 0);
        const total = Math.max(1, totalRaw);
        let cursor = 0;
        return segments.map((seg, i) => {
            const val = Math.max(0, seg.value);
            const share = val / total;
            const start = cursor;
            const end = cursor + share * 360;
            cursor = end;
            return {
                ...seg,
                color: seg.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
                share,
                startAngle: start,
                endAngle: end,
            };
        });
    }, [segments]);

    const total = useMemo(
        () => segments.reduce((s, seg) => s + Math.max(0, seg.value), 0),
        [segments]
    );

    const setActive = (i: number | null) => {
        setActiveIndex(i);
        onSegmentHover?.(i !== null ? segments[i] ?? null : null, i ?? -1);
    };

    const handleLegendKeyDown = (e: KeyboardEvent<HTMLDivElement>, i: number) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setActive(activeIndex === i ? null : i);
        }
    };

    const active = activeIndex !== null ? normalized[activeIndex] : null;

    return (
        <div className={`${styles.donutContainer} ${className ?? ""}`}>
            <div className={styles.donutSvgWrap}>
                <svg
                    className={styles.donutSvg}
                    viewBox={viewBox}
                    role="img"
                    aria-label={ariaLabel}
                    preserveAspectRatio="xMidYMid meet"
                    onPointerLeave={() => showTooltip && setActive(null)}
                >
                    {normalized.map((seg, i) => {
                        const d = buildRingPath(
                            cx,
                            cy,
                            outerR,
                            innerR,
                            seg.startAngle,
                            seg.endAngle
                        );
                        if (!d) return null;
                        const isActive = i === activeIndex;
                        const angle = midAngle(seg.startAngle, seg.endAngle);
                        const angleRad = ((angle - 90) * Math.PI) / 180;
                        const offsetX = isActive ? Math.cos(angleRad) * hoverOffset : 0;
                        const offsetY = isActive ? Math.sin(angleRad) * hoverOffset : 0;
                        return (
                            <path
                                key={`seg-${i}-${seg.label}`}
                                d={d}
                                fill={seg.color}
                                role="button"
                                tabIndex={showTooltip ? 0 : undefined}
                                aria-label={`${seg.label}: ${formatValue(seg.value)}`}
                                className={`${styles.donutSegment} ${
                                    animate ? styles.donutSegmentAnimate : ""
                                } ${isActive ? styles.donutSegmentActive : ""}`}
                                style={{
                                    transform: `translate(${offsetX}px, ${offsetY}px)`,
                                    animationDelay: animate ? `${i * 60}ms` : undefined,
                                    opacity:
                                        activeIndex !== null && !isActive ? 0.55 : 1,
                                }}
                                onPointerEnter={() => showTooltip && setActive(i)}
                                onFocus={() => showTooltip && setActive(i)}
                                onBlur={() => showTooltip && setActive(null)}
                            />
                        );
                    })}
                </svg>

                {showCenterTotal && !active && (
                    <div className={styles.donutCenter}>
                        <div className={styles.donutCenterValue}>
                            {formatValue(total)}
                        </div>
                        <div className={styles.donutCenterLabel}>{centerLabel}</div>
                    </div>
                )}

                {showTooltip && active && (
                    <div className={styles.donutCenter} role="status" aria-live="polite">
                        <div className={styles.donutCenterValue}>
                            {formatValue(active.value)}
                        </div>
                        <div className={styles.donutCenterLabel}>
                            {active.label} · {Math.round(active.share * 100)}%
                        </div>
                    </div>
                )}
            </div>

            {showLegend && (
                <div className={styles.legend}>
                    {normalized.map((seg, i) => (
                        <div
                            key={`legend-${i}-${seg.label}`}
                            className={`${styles.legendItem} ${
                                activeIndex === i ? styles.legendItemActive : ""
                            }`}
                            tabIndex={showTooltip ? 0 : undefined}
                            role={showTooltip ? "button" : undefined}
                            onPointerEnter={() => showTooltip && setActive(i)}
                            onPointerLeave={() => showTooltip && setActive(null)}
                            onFocus={() => showTooltip && setActive(i)}
                            onBlur={() => showTooltip && setActive(null)}
                            onKeyDown={(e) => showTooltip && handleLegendKeyDown(e, i)}
                        >
                            <span
                                className={styles.legendDot}
                                style={{ backgroundColor: seg.color }}
                            />
                            <span>
                                {seg.label} ({formatValue(seg.value)})
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DonutChart;