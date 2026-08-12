import React, { useMemo } from 'react';
import DetailCardList from '../list/List';
import { D2I18n } from "dhis2-semis-types";
import LineChart from '../charts/LineChart';
import DonutChart from '../charts/DonutChart';
import DetailCard from '../card/detail/DetailCard';
import EditNoteIcon from '@mui/icons-material/EditNote';

interface ProfileSummaryProps {
    i18n?: D2I18n;
}

function ProfileSummary(props: ProfileSummaryProps) {
    const { i18n } = props

    const items = [
        {
            label: i18n.t("Full name"),
            value: "Axerinda",
        },
        {
            label: i18n.t("System ID"),
            value: "1234567890",
        },
        {
            label: i18n.t("Date of birth"),
            value: "Not recorded",
        },
        {
            label: i18n.t("Gender"),
            value: "Male",
        },
        {
            label: i18n.t("Nationality"),
            value: "English",
        },
        {
            label: i18n.t("Guardian"),
            value: "Axerinda",
        },
        {
            label: i18n.t("Guardian contact"),
            value: "Not recorded",
        },
    ];

    const attendanceDonutSegments = useMemo(() => [
        { label: i18n.t('Present'), value: 82, color: '#2963a3' },
        { label: i18n.t('Absent'), value: 12, color: '#e74c3c' },
    ], [i18n]);

    const attendanceLineData = useMemo(() => [
        { label: 'Jan', value: 96 },
        { label: 'Feb', value: 92 },
        { label: 'Mar', value: 95 },
        { label: 'Apr', value: 98 },
        { label: 'May', value: 88 },
    ], []);


    const ChartsRow = () => {
        return (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                    <DetailCard
                        i18n={i18n}
                        badge="Pie chart"
                        title="Attendance Vs Absences"
                    >
                        <DonutChart segments={attendanceDonutSegments} />
                    </DetailCard>
                </div>
                <div style={{ flex: '2 1 520px', minWidth: 0 }}>
                    <DetailCard
                        i18n={i18n}
                        badge="Line chart"
                        title="Attendance rate over time"
                    >
                        <LineChart
                            yAxisMin={60}
                            yAxisMax={100}
                            data={attendanceLineData}
                        />
                    </DetailCard>
                </div>
            </div>
        )
    }


    const ProfileDetails = () => {
        return (
            <DetailCard
                badge='123'
                i18n={i18n}
                title='Profile Summary'
                action={{ label: 'Edit', icon: <EditNoteIcon /> }}
                children={<DetailCardList i18n={i18n} items={items} />}
            />
        )
    }

    return { ChartsRow, ProfileDetails }

}

export { ProfileSummary }