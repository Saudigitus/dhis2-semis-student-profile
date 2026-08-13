import { useState } from 'react'
import { Button } from '@dhis2/ui'
import styles from './card.module.css'

interface EventCardProps {
    data: any[],
    pageSize?: number,
    loading?: boolean,
}

const EventCard = (props: EventCardProps) => {
    const { data, pageSize = 10, loading = false } = props;
    const [page, setPage] = useState(1)
    const pageCount = Math.max(1, Math.ceil(data.length / pageSize))
    const currentEvents = data.slice((page - 1) * pageSize, page * pageSize)

    if (loading) {
        return (
            <div className={styles.loading}>Loading...</div>
        )
    }

    const formatDate = (date: string) => {
        if (!date) { return '-' }

        return new Date(date).toLocaleDateString('en-GB',
            { day: '2-digit', month: 'short', year: 'numeric', }
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.cards}>
                {currentEvents.map(event => (
                    <div key={event.event} className={styles.card}
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
                                className={`${styles.status} ${event.status === 'COMPLETED' ? styles.completed : styles.active}`}
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
                            <Button small secondary >
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