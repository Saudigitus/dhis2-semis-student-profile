import { Button } from '@dhis2/ui'
import styles from './card.module.css'
import { useState, useEffect, useRef } from 'react'
import { ModalComponent } from 'dhis2-semis-components'
import ListComponent from '../../../components/list/List'
import { CustomAttributeProps, ProgramConfig } from 'dhis2-semis-types'

interface EventCardProps {
    i18n?: any,
    data?: any[],
    title?: string
    loading?: boolean,
    emptyMessage?: string
    programConfig?: ProgramConfig
    columns: CustomAttributeProps[]
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
    const { i18n, data, columns, loading = false, emptyMessage = "No events found", title, programConfig } = props;
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(LARGE_PAGE_SIZE)
    const containerRef = useRef<HTMLDivElement>(null)
    const [selectedEvent, setSelectedEvent] = useState<any>(null)

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

    const cardHeader = (event: any) => (
        <div className={styles.cardHeader}>
            <div>
                <div className={styles.stage}>Occurred at</div>
                <div className={styles.date}>{formatDate(event?.occurredAt)}</div>
            </div>

            <div className={`${styles.status} ${event?.status === 'COMPLETED' ? styles.completed : styles.active}`}>
                {event?.status}
            </div>
        </div>
    )

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
                                {cardHeader(event)}
                                <div className={styles.divider} />

                                <div className={styles.content}>
                                    <div className={styles.row}>
                                        <span className={styles.label}>Organisation unit</span>
                                        <span className={styles.value}>{event?.orgUnitName || event?.orgUnit}</span>
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
                                    <Button small secondary onClick={() => setSelectedEvent(event)}>Details</Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedEvent &&
                        <ModalComponent
                            open={selectedEvent}
                            handleClose={() => setSelectedEvent(null)}
                            title={`${(title || 'Event details')} (${data.indexOf(selectedEvent) + 1}/${data.length})`}
                        >
                            <div className={styles.details}>
                                <div className={styles.modalCardHeader}>{cardHeader(selectedEvent)}</div>
                                <ListComponent
                                    i18n={i18n}
                                    data={selectedEvent?.dataValues?.map((item: any) => ({
                                        value: item.value,
                                        displayName: columns.find(col => col.id === item.dataElement)?.name || columns.find(col => col.id === item.attribute)?.name || item.dataElementName,
                                    })) || []}
                                />

                                {data?.length > 1 && (<div className={styles.cardFooter}>
                                    <Button small secondary onClick={() => setSelectedEvent(
                                        data[data.indexOf(selectedEvent) - 1] || null
                                    )}>Previous</Button>
                                    <Button small secondary onClick={() => setSelectedEvent(
                                        data[data.indexOf(selectedEvent) + 1] || null
                                    )}>Next</Button>
                                </div>)}
                            </div>

                        </ModalComponent>
                    }

                    {total > 0 && (
                        <div className={styles.pagination}>
                            <span className={styles.paginationInfo}>
                                Showing{' '}
                                {(page - 1) * pageSize + 1}-
                                {Math.min(page * pageSize, total)}{' '}
                                of {total}
                            </span>

                            <div className={styles.paginationActions}>
                                <Button small disabled={page === 1} onClick={() => goToPage(page - 1)}>
                                    Previous
                                </Button>

                                <span className={styles.pageInfo}>
                                    Page {page} of {pageCount}
                                </span>

                                <Button small disabled={page === pageCount} onClick={() => goToPage(page + 1)}>
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