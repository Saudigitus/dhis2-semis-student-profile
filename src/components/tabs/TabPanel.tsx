import { Paper } from '@mui/material';
import styles from './tabs.module.css';
import { Tab, TabBar } from '@dhis2/ui';
import React, { useEffect } from 'react'
import { D2I18n } from "dhis2-semis-types";
import { useUrlParams } from "dhis2-semis-functions";
import { WithBorder, WithPadding } from "dhis2-semis-components";
import { ProfileSummary } from '../summary/ProfileSummary';

interface TabPanelProps {
    i18n?: D2I18n;
}

function TabPanel(props: TabPanelProps): React.ReactElement {
    const { i18n } = props
    const { add, useQuery } = useUrlParams()
    const selectedTab = useQuery.get('tab')
    const { ChartsRow, ProfileDetails } = ProfileSummary({ i18n })

    useEffect(() => {
        add('tab', 'profile-summary')
    }, [])

    const tabsElements = [
        { name: i18n.t('Profile Summary'), value: 'profile-summary', component: <ProfileDetails /> },
        { name: i18n.t('Profile Summary'), value: 'profile-summary-1', component: <ChartsRow /> },
        { name: i18n.t('Profile Summary'), value: 'profile-summary-2', component: <ChartsRow /> },
    ]

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