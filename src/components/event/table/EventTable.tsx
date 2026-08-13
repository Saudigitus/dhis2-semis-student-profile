import { useEffect, useMemo, useState } from 'react'
import { Button } from '@dhis2/ui'

import styles from './table.module.css'

interface TableColumn {
    key: string
    label: string
    render?: (value: any, row: any) => React.ReactNode
}

interface SimpleTableProps {
    data?: any[]
    columns?: TableColumn[]
    pageSize?: number
    loading?: boolean
    emptyMessage?: string
}

const mockEvents = [
    {
        event: 'event-001',
        occurredAt: '2026-08-01',
        status: 'COMPLETED',
        orgUnit: 'Primary School A',
        programStage: 'Attendance',
    },
    {
        event: 'event-002',
        occurredAt: '2026-07-25',
        status: 'COMPLETED',
        orgUnit: 'Primary School A',
        programStage: 'Attendance',
    },
    {
        event: 'event-003',
        occurredAt: '2026-07-18',
        status: 'COMPLETED',
        orgUnit: 'Primary School A',
        programStage: 'Attendance',
    },
    {
        event: 'event-004',
        occurredAt: '2026-07-11',
        status: 'ACTIVE',
        orgUnit: 'Primary School A',
        programStage: 'Attendance',
    },
    {
        event: 'event-005',
        occurredAt: '2026-07-04',
        status: 'COMPLETED',
        orgUnit: 'Primary School A',
        programStage: 'Attendance',
    },
    {
        event: 'event-006',
        occurredAt: '2026-06-27',
        status: 'COMPLETED',
        orgUnit: 'Primary School A',
        programStage: 'Attendance',
    },
    {
        event: 'event-007',
        occurredAt: '2026-06-20',
        status: 'COMPLETED',
        orgUnit: 'Primary School A',
        programStage: 'Attendance',
    },
    {
        event: 'event-008',
        occurredAt: '2026-06-13',
        status: 'COMPLETED',
        orgUnit: 'Primary School A',
        programStage: 'Attendance',
    },
    {
        event: 'event-009',
        occurredAt: '2026-06-06',
        status: 'COMPLETED',
        orgUnit: 'Primary School A',
        programStage: 'Attendance',
    },
    {
        event: 'event-010',
        occurredAt: '2026-05-30',
        status: 'COMPLETED',
        orgUnit: 'Primary School A',
        programStage: 'Attendance',
    },
    {
        event: 'event-011',
        occurredAt: '2026-05-23',
        status: 'ACTIVE',
        orgUnit: 'Primary School A',
        programStage: 'Attendance',
    },
    {
        event: 'event-012',
        occurredAt: '2026-05-16',
        status: 'COMPLETED',
        orgUnit: 'Primary School A',
        programStage: 'Attendance',
    },
]

const columnss = [
    {
        key: 'occurredAt',
        label: 'Date',
    },
    {
        key: 'status',
        label: 'Status',
    },
    {
        key: 'orgUnit',
        label: 'Organisation Unit',
    },
    {
        key: 'programStage',
        label: 'Program Stage',
    },
]

const EventTable = (props: SimpleTableProps) => {
    const {
        columns = columnss,
        data = mockEvents,
        emptyMessage = 'No data found.',
        loading = false,
        pageSize = 5,
    } = props

    const [page, setPage] = useState(1)

    const pageCount = Math.max(
        1,
        Math.ceil(data.length / pageSize)
    )

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
        return key
            .split('.')
            .reduce(
                (value, key) => value?.[key],
                row
            )
    }

    const handlePrevious = () => {
        setPage(current =>
            Math.max(current - 1, 1)
        )
    }

    const handleNext = () => {
        setPage(current =>
            Math.min(current + 1, pageCount)
        )
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                Loading...
            </div>
        )
    }

    return (
        <div className={styles.tableWrapper}>
            <div className={styles.table}>
                <div className={styles.headerRow}>
                    {columns.map(column => (
                        <div
                            key={column.key}
                            className={styles.headerCell}
                        >
                            {column.label}
                        </div>
                    ))}
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
                            {columns.map(column => {
                                const value = getValue(
                                    row,
                                    column.key
                                )

                                const isEmpty =
                                    value === null ||
                                    value === undefined ||
                                    value === ''

                                return (
                                    <div
                                        key={column.key}
                                        className={
                                            isEmpty
                                                ? styles.cellNotRecorded
                                                : styles.cell
                                        }
                                    >
                                        {column.render
                                            ? column.render(
                                                value,
                                                row
                                            )
                                            : value ?? 'Not recorded'}
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