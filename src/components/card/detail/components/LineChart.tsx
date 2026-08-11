import { FunctionComponent, useMemo } from "react";
import styles from "./charts.module.css";

export interface LineChartPoint {
    label: string;
    value: number;
}

export interface LineChartProps {
    data: LineChartPoint[];
    width?: number;
    height?: number;
    padding?: {
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
    };
    yAxisMin?: number;
    yAxisMax?: number;
    yAxisStep?: number;
    yAxisUnit?: string;
    showArea?: boolean;
    showGrid?: boolean;
    showYAxis?: boolean;
    showXAxis?: boolean;
    showPoints?: boolean;
    lineColor?: string;
    areaColor?: string;
    pointRadius?: number;
    smooth?: boolean;
    className?: string;
    ariaLabel?: string;
}

const DEFAULT_LINE_COLOR = "#2963a3";
const DEFAULT_AREA_COLOR = "#cfe2f3";

function buildStraightPath(points: { x: number; y: number }[]): string {
    if (points.length === 0) return "";
    return points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ");
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] ?? points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] ?? p2;
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
}

const LineChart: FunctionComponent<LineChartProps> = (props) => {
    const {
        data,
        width = 720,
        height = 320,
        padding: paddingInput,
        yAxisMin: yMinInput,
        yAxisMax: yMaxInput,
        yAxisStep = 5,
        yAxisUnit = "%",
        showArea = true,
        showGrid = true,
        showYAxis = true,
        showXAxis = true,
        showPoints = true,
        lineColor = DEFAULT_LINE_COLOR,
        areaColor = DEFAULT_AREA_COLOR,
        pointRadius = 6,
        smooth = true,
        className,
        ariaLabel,
    } = props;

    const padding = {
        left: paddingInput?.left ?? 56,
        right: paddingInput?.right ?? 24,
        top: paddingInput?.top ?? 16,
        bottom: paddingInput?.bottom ?? 40,
    };

    const viewBox = useMemo(() => `0 0 ${width} ${height}`, [width, height]);

    const chart = useMemo(() => {
        const innerW = width - padding.left - padding.right;
        const innerH = height - padding.top - padding.bottom;
        const baselineY = padding.top + innerH;

        const values = data.map((d) => d.value);
        const dataMin = values.length > 0 ? Math.min(...values) : 0;
        const dataMax = values.length > 0 ? Math.max(...values) : 100;

        const yAxisMin =
            yMinInput !== undefined
                ? yMinInput
                : Math.floor(dataMin / yAxisStep) * yAxisStep;
        const yAxisMax =
            yMaxInput !== undefined
                ? yMaxInput
                : Math.ceil(dataMax / yAxisStep) * yAxisStep;

        const yTicks: number[] = [];
        for (let v = yAxisMin; v <= yAxisMax + 0.00001; v += yAxisStep) {
            yTicks.push(v);
        }

        const safeData = data.length > 0 ? data : [{ label: "", value: yAxisMin }];
        const n = safeData.length;
        const xStep = n > 1 ? innerW / (n - 1) : 0;

        const yRange = Math.max(0.0001, yAxisMax - yAxisMin);
        const mapY = (value: number) => {
            const clamped = Math.min(yAxisMax, Math.max(yAxisMin, value));
            return padding.top + innerH - ((clamped - yAxisMin) / yRange) * innerH;
        };
        const mapX = (index: number) =>
            padding.left + (n > 1 ? index * xStep : innerW / 2);

        const points = safeData.map((d, i) => ({
            x: mapX(i),
            y: mapY(d.value),
            value: d.value,
            label: d.label,
        }));

        const linePath = smooth
            ? buildSmoothPath(points)
            : buildStraightPath(points);

        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];
        const areaPath =
            points.length > 0
                ? `${linePath} L ${lastPoint.x} ${baselineY} L ${firstPoint.x} ${baselineY} Z`
                : "";

        return {
            innerW,
            innerH,
            baselineY,
            yAxisMin,
            yAxisMax,
            yTicks,
            points,
            linePath,
            areaPath,
        };
    }, [
        data,
        width,
        height,
        padding.top,
        padding.left,
        padding.right,
        padding.bottom,
        yMinInput,
        yMaxInput,
        yAxisStep,
        smooth,
    ]);

    return (
        <div className={`${styles.lineChartContainer} ${className ?? ""}`}>
            <svg
                className={styles.lineChartSvg}
                viewBox={viewBox}
                role="img"
                aria-label={ariaLabel}
                preserveAspectRatio="xMidYMid meet"
            >
                {showGrid &&
                    chart.yTicks.map((tick) => {
                        const y =
                            padding.top +
                            chart.innerH -
                            ((tick - chart.yAxisMin) /
                                Math.max(0.0001, chart.yAxisMax - chart.yAxisMin)) *
                                chart.innerH;
                        return (
                            <line
                                key={`grid-${tick}`}
                                className={styles.gridLine}
                                x1={padding.left}
                                y1={y}
                                x2={padding.left + chart.innerW}
                                y2={y}
                            />
                        );
                    })}

                {showYAxis &&
                    chart.yTicks.map((tick) => {
                        const y =
                            padding.top +
                            chart.innerH -
                            ((tick - chart.yAxisMin) /
                                Math.max(0.0001, chart.yAxisMax - chart.yAxisMin)) *
                                chart.innerH;
                        return (
                            <text
                                key={`y-${tick}`}
                                className={styles.yAxisLabel}
                                x={padding.left - 10}
                                y={y}
                            >
                                {tick}
                                {yAxisUnit}
                            </text>
                        );
                    })}

                {showArea && chart.areaPath && (
                    <path d={chart.areaPath} fill={areaColor} opacity={0.4} aria-hidden="true" />
                )}

                {chart.linePath && (
                    <path
                        d={chart.linePath}
                        fill="none"
                        stroke={lineColor}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}

                {chart.points.map((p, i) => (
                    <g key={`pt-${i}`}>
                        {showPoints && (
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r={pointRadius}
                                fill={lineColor}
                                stroke="#ffffff"
                                strokeWidth={2}
                            />
                        )}
                        {showXAxis && (
                            <text
                                className={styles.xAxisLabel}
                                x={p.x}
                                y={padding.top + chart.innerH + 16}
                            >
                                {p.label}
                            </text>
                        )}
                    </g>
                ))}
            </svg>
        </div>
    );
};

export default LineChart;
