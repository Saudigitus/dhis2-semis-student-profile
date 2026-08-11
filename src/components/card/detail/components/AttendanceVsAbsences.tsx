import { FunctionComponent, ReactNode, useMemo } from "react";
import { D2I18n } from "dhis2-semis-types";
import DetailCard from "../DetailCard";
import chartStyles from "./charts.module.css";

export interface AttendanceVsAbsencesProps {
    i18n: D2I18n;
    present: number;
    absent: number;
    presentColor?: string;
    absentColor?: string;
    title?: string;
    badge?: string;
    presentLabel?: string;
    absentLabel?: string;
    actionLabel?: string;
    actionIcon?: ReactNode;
    onAction?: () => void;
}

const DEFAULT_PRESENT_COLOR = "#2963a3";
const DEFAULT_ABSENT_COLOR = "#e74c3c";

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
        x: cx + r * Math.cos(angleRad),
        y: cy + r * Math.sin(angleRad),
    };
}

function describeArc(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
): string {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
        "M", start.x, start.y,
        "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
    ].join(" ");
}

const AttendanceVsAbsences: FunctionComponent<AttendanceVsAbsencesProps> = (props) => {
    const {
        i18n,
        present,
        absent,
        presentColor = DEFAULT_PRESENT_COLOR,
        absentColor = DEFAULT_ABSENT_COLOR,
        title = "Attendance Vs Absences",
        badge = "Pie chart",
        presentLabel = "Present",
        absentLabel = "Absent",
        actionLabel,
        actionIcon,
        onAction,
    } = props;

    const donut = useMemo(() => {
        const size = 200;
        const cx = size / 2;
        const cy = size / 2;
        const outerR = 85;
        const innerR = 50;

        const total = Math.max(1, present + absent);
        const presentShare = present / total;
        const absentShare = absent / total;

        const presentStart = 0;
        const presentEnd = presentShare * 360;
        const absentStart = presentEnd;
        const absentEnd = 360;

        const ringPath = (startAngle: number, endAngle: number, outer: number, inner: number) => {
            if (endAngle - startAngle <= 0.001) return "";
            const outerStart = polarToCartesian(cx, cy, outer, endAngle);
            const outerEnd = polarToCartesian(cx, cy, outer, startAngle);
            const innerStart = polarToCartesian(cx, cy, inner, startAngle);
            const innerEnd = polarToCartesian(cx, cy, inner, endAngle);
            const largeArc = endAngle - startAngle > 180 ? 1 : 0;
            return [
                "M", outerStart.x, outerStart.y,
                "A", outer, outer, 0, largeArc, 0, outerEnd.x, outerEnd.y,
                "L", innerStart.x, innerStart.y,
                "A", inner, inner, 0, largeArc, 1, innerEnd.x, innerEnd.y,
                "Z",
            ].join(" ");
        };

        const presentPath = ringPath(presentStart, presentEnd, outerR, innerR);
        const absentPath = ringPath(absentStart, absentEnd, outerR, innerR);

        return {
            viewBox: `0 0 ${size} ${size}`,
            presentPath,
            absentPath,
            presentShare,
            absentShare,
        };
    }, [present, absent]);

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
                <div className={chartStyles.donutContainer}>
                    <svg
                        className={chartStyles.donutSvg}
                        viewBox={donut.viewBox}
                        role="img"
                        aria-label={i18n.t(title)}
                    >
                        {donut.presentPath && (
                            <path
                                d={donut.presentPath}
                                fill={presentColor}
                                aria-label={`${presentLabel} ${present}`}
                            />
                        )}
                        {donut.absentPath && (
                            <path
                                d={donut.absentPath}
                                fill={absentColor}
                                aria-label={`${absentLabel} ${absent}`}
                            />
                        )}
                    </svg>
                    <div className={chartStyles.legend}>
                        <div className={chartStyles.legendItem}>
                            <span
                                className={chartStyles.legendDot}
                                style={{ backgroundColor: presentColor }}
                            />
                            <span>{i18n.t(presentLabel)} ({present})</span>
                        </div>
                        <div className={chartStyles.legendItem}>
                            <span
                                className={chartStyles.legendDot}
                                style={{ backgroundColor: absentColor }}
                            />
                            <span>{i18n.t(absentLabel)} ({absent})</span>
                        </div>
                    </div>
                </div>
            </div>
        </DetailCard>
    );
};

export default AttendanceVsAbsences;
