import { useState } from 'react'
import { Button } from '@dhis2/ui'
import styles from './card.module.css'

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

const EventCard = ({
    data = mockEvents,
    pageSize = 4,
}) => {
    const [page, setPage] = useState(1)

    const pageCount = Math.ceil(data.length / pageSize)

    const currentEvents = data.slice(
        (page - 1) * pageSize,
        page * pageSize
    )

    const formatDate = (date: string) => {
        if (!date) {
            return '-'
        }

        return new Date(date).toLocaleDateString(
            'en-GB',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.cards}>
                {currentEvents.map(event => (
                    <div
                        key={event.event}
                        className={styles.card}
                    >
                        <div className={styles.cardHeader}>
                            <div>
                                <div className={styles.stage}>
                                    {event.programStage}
                                </div>

                                <div className={styles.date}>
                                    {formatDate(event.occurredAt)}
                                </div>
                            </div>

                            <div
                                className={`${styles.status} ${event.status === 'COMPLETED'
                                        ? styles.completed
                                        : styles.active
                                    }`}
                            >
                                {event.status}
                            </div>
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.content}>
                            <div className={styles.row}>
                                <span className={styles.label}>
                                    Organisation unit
                                </span>

                                <span className={styles.value}>
                                    {event.orgUnit}
                                </span>
                            </div>

                            <div className={styles.row}>
                                <span className={styles.label}>
                                    Event
                                </span>

                                <span className={styles.value}>
                                    {event.event}
                                </span>
                            </div>
                        </div>

                        <div className={styles.cardFooter}>
                            <Button
                                small
                                secondary
                            >
                                View details
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {data.length > 0 && (
                <div className={styles.pagination}>
                    <span className={styles.paginationInfo}>
                        Showing{' '}
                        {(page - 1) * pageSize + 1}-
                        {Math.min(
                            page * pageSize,
                            data.length
                        )}{' '}
                        of {data.length}
                    </span>

                    <div className={styles.paginationActions}>
                        <Button
                            small
                            disabled={page === 1}
                            onClick={() =>
                                setPage(current => current - 1)
                            }
                        >
                            Previous
                        </Button>

                        <span className={styles.pageInfo}>
                            Page {page} of {pageCount}
                        </span>

                        <Button
                            small
                            disabled={page === pageCount}
                            onClick={() =>
                                setPage(current => current + 1)
                            }
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export { EventCard }