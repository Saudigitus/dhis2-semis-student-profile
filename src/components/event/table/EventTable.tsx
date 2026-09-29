import { Button } from '@dhis2/ui'
import styles from './table.module.css'
import { useEffect, useMemo, useState } from 'react'
import { getDisplayName } from 'dhis2-semis-components'
import { CustomAttributeProps, D2I18n, ProgramConfig } from 'dhis2-semis-types'
import EventModal from '../modal/EventModal'
import { RemoveRedEye } from '@mui/icons-material'

interface EventTableProps {
    i18n: D2I18n,
    data: any[],
    title?: string
    pageSize?: number
    loading?: boolean
    emptyMessage?: string
    programConfig?: ProgramConfig
    columns: CustomAttributeProps[]
}

const utilsColumns = [
    {
        id: 'occurredAt',
        visible: true,
        displayName: 'Date',
    },
    {
        id: 'status',
        visible: true,
        displayName: 'Status',
    },
    {
        id: 'orgUnitName',
        visible: true,
        displayName: 'Organisation Unit',
    },
]

const EventTable = (props: EventTableProps) => {
    const { i18n, columns, data, emptyMessage = 'No data found.',
        loading = false, pageSize = 5, programConfig, title, } = props
    const [page, setPage] = useState(1)
    const pageCount = Math.max(1, Math.ceil(data.length / pageSize))
    const [selectedEvent, setSelectedEvent] = useState<any>(null)


    const tableHeaders = utilsColumns
        ?.concat(columns)
        ?.concat({ id: 'details', visible: true, displayName: 'Details', })
        ?.map(column => ({ ...column, displayName: utilsColumns.some(item => item.id === column.id) || column.id === 'details' ? i18n.t(column.displayName) : column.displayName }))

    useEffect(() => {
        if (page > pageCount) {
            setPage(pageCount)
        }
    }, [page, pageCount])

    const currentData = useMemo(() => {
        const start = (page - 1) * pageSize
        const end = start + pageSize

        return data.slice(start, end)
    }, [data, page, pageSize])

    const getValue = (row: any, key: string) => {
        return getDisplayName({ metaData: key, value: row?.[key] || '', program: programConfig! })
    }

    const handlePrevious = () => {
        setPage(current => Math.max(current - 1, 1))
    }

    const handleNext = () => {
        setPage(current => Math.min(current + 1, pageCount))
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                {i18n.t('Loading...')}
            </div>
        )
    }

    if (!data?.length) {
        return (
            <div className={styles.empty}>
                {i18n.t(emptyMessage)}
            </div>
        )
    }

    return (
        <div className={styles.tableWrapper}>
            <div className={styles.table}>
                <div className={styles.headerRow}>
                    {tableHeaders
                        ?.map(column => (
                            <div
                                key={column.id}
                                className={styles.headerCell}
                            >
                                {column.displayName}
                            </div>
                        ))
                    }
                </div>

                {currentData.length === 0 ? (
                    <div className={styles.empty}>
                        {i18n.t(emptyMessage)}
                    </div>
                ) : (
                    currentData.map((row, rowIndex) => (
                        <div
                            key={row.event || rowIndex}
                            className={styles.row}
                        >
                            {tableHeaders
                                ?.map(column => {
                                    const value = getValue(row, column.id)
                                    const isEmpty = value === null || value === undefined || value === ''

                                    return (
                                        <div
                                            key={column.id}
                                            className={isEmpty ? styles.cellNotRecorded : styles.cell}
                                        >
                                            {
                                                column?.id !== 'details' ?
                                                    value ?? i18n.t('Not recorded')
                                                    :
                                                    <Button small secondary onClick={() => setSelectedEvent(row)}>
                                                        ...
                                                    </Button>
                                            }
                                        </div>
                                    )
                                })}

                        </div>
                    ))
                )}
            </div>

            {data.length > 0 && (
                <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                        {i18n.t('Showing')}{' '}
                        {(page - 1) * pageSize + 1}-
                        {Math.min(
                            page * pageSize,
                            data.length
                        )}{' '}
                        {i18n.t('of')} {data.length}
                    </div>

                    <div className={styles.paginationActions}>
                        <Button small disabled={page === 1} onClick={handlePrevious}>
                            {i18n.t('Previous')}
                        </Button>

                        <span className={styles.pageInfo}>
                            {i18n.t('Page {{page}} of {{count}}', { page, count: pageCount })}
                        </span>

                        <Button small disabled={page === pageCount} onClick={handleNext}>
                            {i18n.t('Next')}
                        </Button>
                    </div>
                </div>
            )}

            {
                selectedEvent &&
                <EventModal
                    i18n={i18n}
                    events={data}
                    title={title}
                    selectedEvent={selectedEvent}
                    setSelectedEvent={setSelectedEvent}
                    columns={columns?.filter(col => col.visible) || []}
                />
            }
        </div>
    )
}

export { EventTable }
