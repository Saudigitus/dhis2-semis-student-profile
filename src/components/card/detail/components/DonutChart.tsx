import { FunctionComponent, useMemo } from "react";
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

const DonutChart: FunctionComponent<DonutChartProps> = (props) => {
    const {
        segments,
        size = 200,
        outerRadius,
        innerRadius,
        showLegend = true,
        className,
        ariaLabel,
    } = props;

    const cx = size / 2;
    const cy = size / 2;
    const outerR = outerRadius ?? Math.floor(size * 0.425);
    const innerR = innerRadius ?? Math.floor(size * 0.25);

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

    return (
        <div className={`${styles.donutContainer} ${className ?? ""}`}>
            <svg
                className={styles.donutSvg}
                viewBox={viewBox}
                role="img"
                aria-label={ariaLabel}
                preserveAspectRatio="xMidYMid meet"
            >
                {normalized.map((seg, i) => {
                    const d = buildRingPath(cx, cy, outerR, innerR, seg.startAngle, seg.endAngle);
                    if (!d) return null;
                    return (
                        <path
                            key={`seg-${i}-${seg.label}`}
                            d={d}
                            fill={seg.color}
                            aria-label={`${seg.label}: ${seg.value}`}
                        />
                    );
                })}
            </svg>
            {showLegend && (
                <div className={styles.legend}>
                    {normalized.map((seg, i) => (
                        <div key={`legend-${i}-${seg.label}`} className={styles.legendItem}>
                            <span
                                className={styles.legendDot}
                                style={{ backgroundColor: seg.color }}
                            />
                            <span>{seg.label} ({seg.value})</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DonutChart;
