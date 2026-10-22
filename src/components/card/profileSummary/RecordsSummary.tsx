import React, { useMemo } from "react";
import ProfileSummaryCard from "./ProfileSummaryCard";
import useGetSelectedKeys from "../../../hooks/config/useGetSelectedKeys";
import { D2I18n } from 'dhis2-semis-types';
import type { FormattedEvents } from "../../../utils/profile/formatEnrollmentEvents";

const NUMBER_TYPES = ['NUMBER', 'INTEGER', 'INTEGER_POSITIVE', 'INTEGER_ZERO_OR_POSITIVE', 'PERCENTAGE'];

// Summary of the selected year counted from its records (SEMIS-248), so it does not depend on analytics having run.
const RecordsSummary = ({ events, i18n }: { events: FormattedEvents; i18n: D2I18n }) => {
    const { dataStoreData, program } = useGetSelectedKeys();
    const data: any = dataStoreData;

    const cards = useMemo(() => {
        const result: { label: string; value: string }[] = [];
        const attendance = data?.attendance;

        if (attendance?.programStage && attendance?.enabled !== false) {
            const absentCode = attendance?.statusOptions?.find((option: any) => option?.configKey === 'absentCode')?.code;
            const absences = (events?.[attendance.programStage] ?? [])
                .filter((event: any) => event?.dataValues?.some((value: any) => value.dataElement === attendance.status && value.value === absentCode))
                .length;
            result.push({ label: i18n.t('Absences'), value: String(absences) });
        }

        if (data?.performance?.enabled !== false) {
            for (const { programStage } of data?.performance?.programStages ?? []) {
                const stage = program?.programStages?.find((item) => item.id === programStage);
                if (!stage) continue;

                const numeric = new Set((stage.programStageDataElements ?? [])
                    .filter((item: any) => NUMBER_TYPES.includes(item?.dataElement?.valueType))
                    .map((item: any) => item?.dataElement?.id));
                const marks = (events?.[programStage] ?? [])
                    .flatMap((event: any) => event?.dataValues ?? [])
                    .filter((value: any) => numeric.has(value.dataElement) && value.value !== '' && !isNaN(Number(value.value)))
                    .map((value: any) => Number(value.value));

                result.push({
                    label: i18n.t('{{stage}} average', { stage: stage.displayName }),
                    value: marks.length ? (marks.reduce((sum: number, mark: number) => sum + mark, 0) / marks.length).toFixed(1) : '—',
                });
            }
        }

        return result;
    }, [events, data, program]);

    if (!cards.length) return null;

    return (
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {cards.map((card) => (
                <ProfileSummaryCard key={card.label} value={card.value} label={card.label} variant="info" />
            ))}
        </div>
    );
};

export default RecordsSummary;
