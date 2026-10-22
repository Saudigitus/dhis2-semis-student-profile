import { Paper } from '@mui/material';
import styles from './tabs.module.css';
import { Tab, TabBar } from '@dhis2/ui';
import React, { useEffect, useMemo } from 'react'
import { D2I18n, VariablesTypes } from "dhis2-semis-types";
import { useHeader, useUrlParams } from "dhis2-semis-functions";
import { EventTable, EventCard } from "../event/index"
import { WithBorder, WithPadding } from "dhis2-semis-components";
import useGetSelectedKeys from '../../hooks/config/useGetSelectedKeys';
import ListComponent from '../list/List';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DetailCard from '../card/detail/DetailCard';
import { useHeaders } from '../../hooks/useHeaders/useHeaders';
import { buildProfileTabs } from '../../utils/profile/buildProfileLayout';

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

    // Tabs and cards come from the metadata and the SEMIS modules (SEMIS-248), not from a profile configuration.
    const tabs = useMemo(() => buildProfileTabs(dataStoreData, program, i18n), [dataStoreData, program])

    useEffect(() => {
        if (tabs.length && !tabs.some(tab => tab.id === selectedTab)) add('tab', tabs[0].id)
    }, [tabs, selectedTab])

    const componentsMapping: any = {
        "TEI_FORM": ListComponent,
        "EVENT_TABLE": EventTable,
        "EVENT_CARDS": EventCard,
    }

    const tabsElements = tabs
            .map((tab) => ({
                value: tab?.id,
                name: tab?.displayName,
                component: <div
                    key={tab.id}
                    className={tab?.components?.length > 1 ? styles.panelgrid : ''}
                >
                    {[...tab.components]
                        .map((component, index) => {
                            const Component = componentsMapping[component?.type]

                            if (!Component) {
                                return null
                            }

                            return (
                                <DetailCard
                                    badge=''
                                    i18n={i18n}
                                    key={`${tab.id}-${index}`}
                                    title={component?.displayName ?? tab?.displayName}
                                // action={component?.editable ? { label: 'Edit', icon: <EditNoteIcon /> } : undefined}
                                >
                                    <Component
                                        i18n={i18n}
                                        loading={loading}
                                        programConfig={program}
                                        title={component?.displayName ?? tab?.displayName}
                                        data={component?.type === "TEI_FORM" ?
                                            // Every attribute of the program (the photo is in the header), or those of the section.
                                            columns
                                                ?.filter(col => col?.type === VariablesTypes.Attribute && String(col?.valueType) !== 'IMAGE')
                                                ?.filter(col => !component?.attributes || component.attributes.includes(col?.id))
                                                ?.map((col) => ({
                                                    ...col,
                                                    attribute: col?.id,
                                                    value: attributes?.find((attr: any) => attr?.attribute === col?.id)?.value || ""
                                                }))
                                            :
                                            events?.[component?.programStage!] || []
                                        }
                                        // Data elements "display in reports"; none means the record shows only its date and school.
                                        columns={eventHeaders?.[component?.programStage!]
                                            ?.filter(col => col.visible) || []}
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