import { Paper } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import styles from './tabs.module.css';
import chartStyles from '../card/detail/components/charts.module.css';
import { Tab, TabBar } from '@dhis2/ui';
import React, { useEffect, useMemo } from 'react'
import { D2I18n } from "dhis2-semis-types";
import { useUrlParams } from "dhis2-semis-functions";
import { WithBorder, WithPadding } from "dhis2-semis-components";
import DetailCard from '../card/detail/DetailCard';
import DetailCardList from '../card/detail/components/List';
import DonutChart from '../card/detail/components/DonutChart';
import LineChart from '../card/detail/components/LineChart';

interface TabPanelProps {
    i18n?: D2I18n;
}

function TabPanel(props: TabPanelProps): React.ReactElement {
    const { i18n } = props
    const { add, useQuery } = useUrlParams()
    const selectedTab = useQuery.get('tab')


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

    const chartsRow = useMemo(() => (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                <DetailCard
                    i18n={i18n}
                    title="Attendance Vs Absences"
                    badge="Pie chart"
                    action={{
                        label: 'Edit',
                        icon: <EditNoteIcon sx={{ fontSize: 16 }} />,
                    }}
                >
                    <div className={chartStyles.chartWrapper}>
                        <DonutChart segments={attendanceDonutSegments} />
                    </div>
                </DetailCard>
            </div>
            <div style={{ flex: '2 1 520px', minWidth: 0 }}>
                <DetailCard
                    i18n={i18n}
                    title="Attendance rate over time"
                    badge="Line chart"
                    action={{
                        label: 'Edit',
                        icon: <EditNoteIcon sx={{ fontSize: 16 }} />,
                    }}
                >
                    <div className={chartStyles.chartWrapper}>
                        <LineChart
                            data={attendanceLineData}
                            yAxisMin={60}
                            yAxisMax={100}
                        />
                    </div>
                </DetailCard>
            </div>
        </div>
    ), [i18n, attendanceDonutSegments, attendanceLineData]);


    const tabsElements = [
        {
            name: 'Profile Summary', value: 'profile-summary', component: <>
                <DetailCard
                    badge='123'
                    i18n={i18n}
                    title='Profile Summary'
                    action={{ label: 'Edit' }}
                    children={<DetailCardList i18n={i18n} items={items} />}
                />
                <div style={{ height: 16 }} />
                {chartsRow}
            </>
        },
        { name: 'Profile Summary', value: 'profile-summary-1', component: <>Profile Summary Tab 1</> },
        { name: 'Profile Summary', value: 'profile-summary-2', component: <>Profile Summary Tab 2</> },
    ]

    useEffect(() => {
        add('tab', 'profile-summary')
    }, [])

    return (
        <Paper >
            <WithBorder type='bottom'>
                {<div className={styles.header}>
                    <TabBar fixed>
                        {tabsElements?.map((element, i) => (
                            <Tab
                                key={i}
                                onClick={() => add('tab', element.value)}
                                selected={selectedTab === element.value}
                            >
                                <WithPadding p="0px">{element.name} </WithPadding>
                            </Tab>
                        ))}
                    </TabBar>
                </div>}
            </WithBorder>
            <WithPadding>
                <div className={styles.content}>
                    {tabsElements?.find((element) => element.value === selectedTab)?.component}
                </div>
            </WithPadding>
        </Paper>
    )
}

export default TabPanel