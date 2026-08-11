import { FunctionComponent, ReactNode, useMemo } from "react";
import { D2I18n } from "dhis2-semis-types";
import DetailCard from "../DetailCard";
import chartStyles from "./charts.module.css";

export interface AttendanceRatePoint {
    label: string;
    value: number;
}

export interface AttendanceRateOverTimeProps {
    i18n: D2I18n;
    data: AttendanceRatePoint[];
    title?: string;
    badge?: string;
    yAxisMin?: number;
    yAxisMax?: number;
    yAxisStep?: number;
    lineColor?: string;
    areaColor?: string;
    actionLabel?: string;
    actionIcon?: ReactNode;
    onAction?: () => void;
}

const DEFAULT_LINE_COLOR = "#2963a3";
const DEFAULT_AREA_COLOR = "#cfe2f3";

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

const AttendanceRateOverTime: FunctionComponent<AttendanceRateOverTimeProps> = (props) => {
    const {
        i18n,
        data,
        title = "Attendance rate over time",
        badge = "Line chart",
        yAxisMin = 60,
        yAxisMax = 100,
        yAxisStep = 5,
        lineColor = DEFAULT_LINE_COLOR,
        areaColor = DEFAULT_AREA_COLOR,
        actionLabel,
        actionIcon,
        onAction,
    } = props;

    const chart = useMemo(() => {
        const width = 720;
        const height = 320;
        const paddingLeft = 56;
        const paddingRight = 24;
        const paddingTop = 16;
        const paddingBottom = 40;

        const innerW = width - paddingLeft - paddingRight;
        const innerH = height - paddingTop - paddingBottom;

        const yTicks: number[] = [];
        for (let v = yAxisMin; v <= yAxisMax; v += yAxisStep) {
            yTicks.push(v);
        }

        const safeData = data.length > 0 ? data : [{ label: "", value: yAxisMin }];
        const n = safeData.length;
        const xStep = n > 1 ? innerW / (n - 1) : 0;

        const yRange = Math.max(0.0001, yAxisMax - yAxisMin);
        const mapY = (value: number) => {
            const clamped = Math.min(yAxisMax, Math.max(yAxisMin, value));
            return paddingTop + innerH - ((clamped - yAxisMin) / yRange) * innerH;
        };
        const mapX = (index: number) =>
            paddingLeft + (n > 1 ? index * xStep : innerW / 2);

        const points = safeData.map((d, i) => ({
            x: mapX(i),
            y: mapY(d.value),
            value: d.value,
            label: d.label,
        }));

        const linePath = buildSmoothPath(points);

        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];
        const areaBaseline = paddingTop + innerH;
        const areaPath =
            points.length > 0
                ? `${linePath} L ${lastPoint.x} ${areaBaseline} L ${firstPoint.x} ${areaBaseline} Z`
                : "";

        const viewBox = `0 0 ${width} ${height}`;

        return {
            width,
            height,
            viewBox,
            yTicks,
            paddingLeft,
            paddingRight,
            paddingTop,
            paddingBottom,
            innerW,
            innerH,
            linePath,
            areaPath,
            points,
            areaBaseline,
        };
    }, [data, yAxisMin, yAxisMax, yAxisStep]);

    return (
        <DetailCard
            i18n={i18n}
            title={title}
            badge={badge}
            actionLabel={actionLabel}
            actionIcon={actionIcon}
            onAction={onAction}
        >
            <div className={chartStyles.chartWrapper}>
                <div className={chartStyles.lineChartContainer}>
                    <svg
                        className={chartStyles.lineChartSvg}
                        viewBox={chart.viewBox}
                        role="img"
                        aria-label={i18n.t(title)}
                        preserveAspectRatio="xMidYMid meet"
                    >
                        {chart.yTicks.map((tick) => {
                            const y =
                                chart.paddingTop +
                                chart.innerH -
                                ((tick - yAxisMin) / Math.max(0.0001, yAxisMax - yAxisMin)) *
                                    chart.innerH;
                            return (
                                <g key={`y-${tick}`}>
                                    <line
                                        className={chartStyles.gridLine}
                                        x1={chart.paddingLeft}
                                        y1={y}
                                        x2={chart.paddingLeft + chart.innerW}
                                        y2={y}
                                    />
                                    <text
                                        className={chartStyles.yAxisLabel}
                                        x={chart.paddingLeft - 10}
                                        y={y}
                                    >
                                        {tick}%
                                    </text>
                                </g>
                            );
                        })}

                        {chart.areaPath && (
                            <path
                                d={chart.areaPath}
                                fill={areaColor}
                                opacity={0.4}
                                aria-hidden="true"
                            />
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
                            <g key={`point-${i}`}>
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={6}
                                    fill={lineColor}
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                />
                                <text
                                    className={chartStyles.xAxisLabel}
                                    x={p.x}
                                    y={chart.paddingTop + chart.innerH + 16}
                                >
                                    {p.label}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>
            </div>
        </DetailCard>
    );
};

export default AttendanceRateOverTime;
