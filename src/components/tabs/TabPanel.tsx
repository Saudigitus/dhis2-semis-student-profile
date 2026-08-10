import React, { useEffect } from 'react'
import { Paper } from '@mui/material';
import styles from './tabs.module.css';
import { Tab, TabBar } from '@dhis2/ui';
import { useUrlParams } from "dhis2-semis-functions";
import { WithBorder, WithPadding } from "dhis2-semis-components";

interface TabPanelProps {
}

function TabPanel(props: TabPanelProps): React.ReactElement {
    const { } = props
    const { add, useQuery } = useUrlParams()
    const selectedTab = useQuery.get('tab')

    const tabsElements = [
        { name: 'Profile Summary', value: 'profile-summary', component: <>Profile Summary Tab</> },
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