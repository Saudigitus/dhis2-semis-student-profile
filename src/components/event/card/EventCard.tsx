import { useState, useEffect, useRef } from 'react'
import { Button } from '@dhis2/ui'
import styles from './card.module.css'
import { ProgramConfig } from 'dhis2-semis-types'

interface EventCardProps {
    data?: any[],
    loading?: boolean,
    emptyMessage?: string
    programConfig?: ProgramConfig
}

// Breakpoints que definem o número de colunas (4 / 2 / 1).
// Têm de ser os MESMOS valores usados no CSS (@container max-width) para
// que o número de cards por página corresponda ao número de colunas visíveis.
const BREAKPOINT_LARGE = 700   // >= 700px  -> 4 colunas
const BREAKPOINT_SMALL = 400   // 400-699px -> 2 colunas ; < 400px -> 1 coluna
const NARROW_PAGE_SIZE = 1
const SMALL_PAGE_SIZE = 2
const LARGE_PAGE_SIZE = 4

const getPageSize = (width: number) => {
    if (width < BREAKPOINT_SMALL) return NARROW_PAGE_SIZE
    if (width < BREAKPOINT_LARGE) return SMALL_PAGE_SIZE
    return LARGE_PAGE_SIZE
}

const EventCard = (props: EventCardProps) => {
    const { data, loading = false, emptyMessage = "No events found", programConfig } = props;
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(LARGE_PAGE_SIZE)
    const containerRef = useRef<HTMLDivElement>(null)

    // Observa a largura do container e ajusta o pageSize (1, 2 ou 4)
    // para acompanhar o número de colunas definido no CSS.
    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const observer = new ResizeObserver(entries => {
            const width = entries[0]?.contentRect?.width ?? 0
            setPageSize(getPageSize(width))
        })

        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const total = data?.length || 0
    const pageCount = Math.max(1, Math.ceil(total / pageSize))

    // Mantém a página dentro do intervalo válido sempre que
    // os dados ou o pageSize (por mudança de tamanho) mudam.
    useEffect(() => {
        setPage(current => Math.min(current, pageCount))
    }, [total, pageSize, pageCount])

    const currentEvents = data?.slice((page - 1) * pageSize, page * pageSize) || []

    const formatDate = (date: string) => {
        if (!date) { return '-' }

        return new Date(date).toLocaleDateString('en-GB',
            { day: '2-digit', month: 'short', year: 'numeric', }
        )
    }

    const goToPage = (target: number) => {
        setPage(Math.min(Math.max(target, 1), pageCount))
    }

    return (
        <div className={styles.container} ref={containerRef}>
            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : !data?.length ? (
                <div className={styles.empty}>
                    {emptyMessage}
                </div>
            ) : (
                <>
                    <div className={styles.cards}>
                        {currentEvents.map(event => (
                            <div
                                key={event?.event}
                                className={`${styles.card} ${total === 1 ? styles.full : ''}`}
                            >
                                <div className={styles.cardHeader}>
                                    <div>
                                        <div className={styles.stage}>Occurred at</div>
                                        <div className={styles.date}>{formatDate(event?.occurredAt)}</div>
                                    </div>

                                    <div className={`${styles.status} ${event?.status === 'COMPLETED' ? styles.completed : styles.active}`}>
                                        {event?.status}
                                    </div>
                                </div>

                                <div className={styles.divider} />

                                <div className={styles.content}>
                                    <div className={styles.row}>
                                        <span className={styles.label}>Organisation unit</span>
                                        <span className={styles.value}>{event?.orgUnitName || event?.orgUnit}</span>
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
                                    <Button small secondary>Details</Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {total > 0 && (
                        <div className={styles.pagination}>
                            <span className={styles.paginationInfo}>
                                Showing{' '}
                                {(page - 1) * pageSize + 1}-
                                {Math.min(page * pageSize, total)}{' '}
                                of {total}
                            </span>

                            <div className={styles.paginationActions}>
                                <Button
                                    small
                                    disabled={page === 1}
                                    onClick={() => goToPage(page - 1)}
                                >
                                    Previous
                                </Button>

                                <span className={styles.pageInfo}>
                                    Page {page} of {pageCount}
                                </span>

                                <Button
                                    small
                                    disabled={page === pageCount}
                                    onClick={() => goToPage(page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export { EventCard }