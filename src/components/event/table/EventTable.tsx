import { Button } from '@dhis2/ui'
import styles from './table.module.css'
import { useEffect, useMemo, useState } from 'react'
import { getDisplayName } from 'dhis2-semis-components'
import { CustomAttributeProps, ProgramConfig } from 'dhis2-semis-types'

interface EventTableProps {
    data: any[]
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
    const { columns, data, emptyMessage = 'No data found.', loading = false, pageSize = 5, programConfig } = props
    const [page, setPage] = useState(1)
    const pageCount = Math.max(1, Math.ceil(data.length / pageSize))

    console.log(data)

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
                Loading...
            </div>
        )
    }

    if (!data?.length) {
        return (
            <div className={styles.empty}>
                {emptyMessage}
            </div>
        )
    }

    return (
        <div className={styles.tableWrapper}>
            <div className={styles.table}>
                <div className={styles.headerRow}>
                    {utilsColumns
                        ?.concat(columns)
                        ?.filter(column => column.visible)
                        .map(column => (
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
                        {emptyMessage}
                    </div>
                ) : (
                    currentData.map((row, rowIndex) => (
                        <div
                            key={row.event || rowIndex}
                            className={styles.row}
                        >
                            {utilsColumns
                                ?.concat(columns)
                                ?.filter(column => column.visible)
                                .map(column => {
                                    const value = getValue(row, column.id)
                                    const isEmpty = value === null || value === undefined || value === ''

                                    return (
                                        <div
                                            key={column.id}
                                            className={isEmpty ? styles.cellNotRecorded : styles.cell}
                                        >
                                            {value ?? 'Not recorded'}
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
                        Showing{' '}
                        {(page - 1) * pageSize + 1}-
                        {Math.min(
                            page * pageSize,
                            data.length
                        )}{' '}
                        of {data.length}
                    </div>

                    <div className={styles.paginationActions}>
                        <Button
                            small
                            disabled={page === 1}
                            onClick={handlePrevious}
                        >
                            Previous
                        </Button>

                        <span className={styles.pageInfo}>
                            Page {page} of {pageCount}
                        </span>

                        <Button
                            small
                            disabled={page === pageCount}
                            onClick={handleNext}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export { EventTable }