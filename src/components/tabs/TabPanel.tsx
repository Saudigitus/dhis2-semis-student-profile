import { Paper } from '@mui/material';
import styles from './tabs.module.css';
import { Tab, TabBar } from '@dhis2/ui';
import React, { useEffect } from 'react'
import { D2I18n } from "dhis2-semis-types";
import { useUrlParams } from "dhis2-semis-functions";
import { EventTable, EventCard } from "../event/index"
import { WithBorder, WithPadding } from "dhis2-semis-components";
import useGetSelectedKeys from '../../hooks/config/useGetSelectedKeys';
import ListComponent from '../list/List';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DetailCard from '../card/detail/DetailCard';

interface TabPanelProps {
    i18n?: D2I18n;
}

function TabPanel(props: TabPanelProps): React.ReactElement {
    const { i18n } = props
    const { add, useQuery } = useUrlParams()
    const selectedTab = useQuery.get('tab')
    const { dataStoreData } = useGetSelectedKeys()

    const helper = {
        "identityCard": {
            "badges": [
                {
                    "order": 0,
                    "source": "FINAL_RESULT_STATUS",
                    "styled": true
                },
                {
                    "attribute": "X0vzx18XWqu",
                    "order": 1,
                    "source": "ATTRIBUTE",
                    "styled": true
                }
            ],
            "photo": {
                "attribute": "cFYnzcqZyZ9"
            },
            "subtitle": {
                "attributes": [
                    "G0B8B0AH5Ek"
                ],
                "separator": " , "
            },
            "title": {
                "attributes": [
                    "gz8w04YBSS0",
                    "ZIDlK6BaAU2"
                ],
                "separator": " , "
            }
        },
        "program": "wQaiD2V27Dp",
        "tabs": [
            {
                "color": "#1D5B79",
                "components": [
                    {
                        "displayName": "Identity",
                        "editable": true,
                        "order": 0,
                        "size": "w6",
                        "type": "TEI_FORM"
                    },
                    {
                        "details": {
                            "pageSize": 1,
                            "programStage": "Wi3KEZ7C3w9"
                        },
                        "displayName": "Socio-economic details",
                        "editable": false,
                        "order": 1,
                        "size": "w6",
                        "type": "EVENT_CARDS"
                    }
                ],
                "createdAt": 1786521780352,
                "displayName": "Personal details",
                "id": "tab-1786521780352-ov1qk",
                "order": 0
            },
            {
                "color": "#468B97",
                "components": [
                    {
                        "details": {
                            "pageSize": 9,
                            "programStage": "Ljyrr3cktAr"
                        },
                        "displayName": "Attendance history",
                        "editable": false,
                        "order": 0,
                        "size": "w12",
                        "type": "EVENT_TABLE"
                    }
                ],
                "createdAt": 1786521780352,
                "displayName": "Attendance",
                "id": "tab-1786521780352-at3nc",
                "order": 1
            },
            {
                "color": "#468B97",
                "components": [
                    {
                        "details": {
                            "pageSize": 1,
                            "programStage": "mBEhR2M4DRQ"
                        },
                        "displayName": "Term 1",
                        "editable": true,
                        "order": 0,
                        "size": "w12",
                        "type": "EVENT_CARDS"
                    },
                    {
                        "details": {
                            "pageSize": 1,
                            "programStage": "mBEhR2M4DRQ"
                        },
                        "displayName": "Term 2",
                        "editable": true,
                        "order": 1,
                        "size": "w12",
                        "type": "EVENT_CARDS"
                    },
                    {
                        "details": {
                            "pageSize": 1,
                            "programStage": "mBEhR2M4DRQ"
                        },
                        "displayName": "Term 3",
                        "editable": true,
                        "order": 2,
                        "size": "w12",
                        "type": "EVENT_CARDS"
                    }
                ],
                "createdAt": 1786521780352,
                "displayName": "Performance",
                "id": "tab-1786521780352-pf2rm",
                "order": 2
            },
            {
                "color": "#468B97",
                "components": [
                    {
                        "details": {
                            "pageSize": 1,
                            "programStage": "hcrjYJ6Yl5F"
                        },
                        "displayName": "Final result",
                        "editable": true,
                        "order": 0,
                        "size": "w12",
                        "type": "EVENT_CARDS"
                    }
                ],
                "createdAt": 1786521780352,
                "displayName": "Final results",
                "id": "tab-1786521780352-fr4dl",
                "order": 3
            },
            {
                "color": "#468B97",
                "components": [
                    {
                        "details": {
                            "pageSize": 9,
                            "programStage": "uewAr6TmLkw"
                        },
                        "displayName": "Transfers",
                        "editable": false,
                        "order": 0,
                        "size": "w12",
                        "type": "EVENT_TABLE"
                    }
                ],
                "createdAt": 1786521780352,
                "displayName": "Transfers",
                "id": "tab-1786521780352-tr5wq",
                "order": 4
            }
        ]
    }

    useEffect(() => {
        add('tab', helper?.tabs?.sort((a, b) => a.order - b.order)[0]?.id)
    }, [])

    const componentsMapping: any = {
        "TEI_FORM": ListComponent,
        "EVENT_TABLE": EventTable,
        "EVENT_CARDS": EventCard,
    }

    const tabsElements = helper?.tabs
        ?.sort((a, b) => a.order - b.order)
        ?.map((tab) => ({
            value: tab?.id,
            name: tab?.displayName,
            component: <div key={tab.id}>
                {[...tab.components]
                    .map(component => {
                        const Component = componentsMapping[component.type]

                        if (!Component) {
                            return null
                        }

                        return (
                            <DetailCard
                                badge=''
                                i18n={i18n}
                                title={tab?.displayName}
                                action={component.editable ? { label: 'Edit', icon: <EditNoteIcon /> } : undefined}
                            >
                                <Component
                                    key={`${tab.id}-${component.order}`}
                                />
                            </DetailCard>
                        )
                    })}
            </div>
        }))

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