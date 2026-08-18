import { Paper } from '@mui/material';
import styles from './tabs.module.css';
import { Tab, TabBar } from '@dhis2/ui';
import React, { useEffect } from 'react'
import { D2I18n, VariablesTypes } from "dhis2-semis-types";
import { useHeader, useUrlParams } from "dhis2-semis-functions";
import { EventTable, EventCard } from "../event/index"
import { WithBorder, WithPadding } from "dhis2-semis-components";
import useGetSelectedKeys from '../../hooks/config/useGetSelectedKeys';
import ListComponent from '../list/List';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DetailCard from '../card/detail/DetailCard';
import { useHeaders } from '../../hooks/useHeaders/useHeaders';

interface TabPanelProps {
    i18n: D2I18n;
    events?: any;
    attributes?: any
    loading?: boolean;
}

function TabPanel(props: TabPanelProps): React.ReactElement {
    const { i18n, loading, attributes, events } = props
    const { add, useQuery } = useUrlParams()
    const selectedTab = useQuery.get('tab')
    const { dataStoreData, program } = useGetSelectedKeys()
    const { columns } = useHeader({ programConfigData: program!, dataStoreData: dataStoreData as any })
    const { headers: eventHeaders } = useHeaders({ programConfigData: program!, dataStoreData: dataStoreData as any })

    useEffect(() => {
        add('tab', [...(dataStoreData?.profile?.tabs || [])].sort((a, b) => a?.order - b?.order)?.[0]?.id)
    }, [])

    const componentsMapping: any = {
        "TEI_FORM": ListComponent,
        "EVENT_TABLE": EventTable,
        "EVENT_CARDS": EventCard,
    }

    const tabsElements = dataStoreData?.profile?.tabs
        ? [...dataStoreData.profile.tabs]
            .sort((a, b) => a?.order - b?.order)
            .map((tab) => ({
                value: tab?.id,
                name: tab?.displayName,
                component: <div
                    key={tab.id}
                    className={tab?.components?.length > 1 ? styles.panelgrid : ''}
                >
                    {[...tab.components]
                        .map(component => {
                            const Component = componentsMapping[component?.type]

                            if (!Component) {
                                return null
                            }

                            return (
                                <DetailCard
                                    badge=''
                                    i18n={i18n}
                                    key={`${tab.id}-${component?.order}`}
                                    title={component?.displayName ?? tab?.displayName}
                                // action={component?.editable ? { label: 'Edit', icon: <EditNoteIcon /> } : undefined}
                                >
                                    <Component
                                        i18n={i18n}
                                        loading={loading}
                                        programConfig={program}
                                        pageSize={component?.details?.pageSize}
                                        title={component?.displayName ?? tab?.displayName}
                                        data={component?.type === "TEI_FORM" ?
                                            columns
                                                ?.filter(col => col?.visible && col?.type === VariablesTypes.Attribute)
                                                ?.map((col) => ({
                                                    ...col,
                                                    attribute: col?.id,
                                                    value: attributes?.find((attr: any) => attr?.attribute === col?.id)?.value || ""
                                                }))
                                            :
                                            events?.[component?.details!?.programStage] || []
                                        }
                                        columns={eventHeaders?.[component?.details!?.programStage]?.filter(col => col.visible) || [] || []}
                                    />
                                </DetailCard>
                            )
                        })}
                </div>
            })) : []

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
                                <WithPadding p="0">{element.name} </WithPadding>
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