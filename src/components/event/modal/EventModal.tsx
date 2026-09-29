import styles from './modal.module.css'
import { FunctionComponent } from "react";
import { ModalComponent } from "dhis2-semis-components";
import ListComponent from "../../../components/list/List";
import { Button } from '@dhis2/ui';
import { CustomAttributeProps, D2I18n } from 'dhis2-semis-types';
import { format } from 'date-fns';

interface EventModalProps {
    i18n: D2I18n,
    events?: any[],
    title?: string
    selectedEvent: any
    setSelectedEvent: any
    columns: CustomAttributeProps[]
}

const EventModal: FunctionComponent<EventModalProps> = (props) => {
    const { i18n, events = [], title, selectedEvent, setSelectedEvent, columns } = props;

    return (
        <ModalComponent
            open={selectedEvent}
            handleClose={() => setSelectedEvent(null)}
            title={`${(title || i18n.t('Event details'))} (${events.indexOf(selectedEvent) + 1}/${events.length})`}
        >
            <div className={styles.details}>
                <div className={styles.modalHeader}>
                    <div>
                        <div className={styles.stage}>{i18n.t('Occurred at')}</div>
                        <div className={styles.date}>{format(new Date(selectedEvent?.occurredAt), 'yyyy-MM-dd')}</div>
                    </div>

                    <div className={styles.modalHeaderRight}>
                        <span className={styles.value}>{selectedEvent?.orgUnitName || selectedEvent?.orgUnit}</span>
                        <div className={`${styles.status} ${selectedEvent?.status === 'COMPLETED' ? styles.completed : styles.active}`}>
                            {i18n.t(selectedEvent?.status || '')}
                        </div>
                    </div>
                </div>
                <div className={styles.content}>
                    {selectedEvent?.dataValues?.length ?
                        <span className={styles.label}>{i18n.t('Details')}</span>
                        : <span className={styles.label}>{i18n.t('No Details')}</span>
                    }
                </div>
                <ListComponent
                    i18n={i18n}
                    data={columns.map((column: any) => {
                        const dataValue = selectedEvent?.dataValues?.find((item: any) => item.dataElement === column.id || item.attribute === column.id)

                        return {
                            value: dataValue?.value,
                            displayName: column.name,
                            attribute: dataValue?.dataElement,
                        }
                    }) || []}
                />

                {events?.length > 1 && (<div className={styles.modalButtons}>
                    <Button small secondary onClick={() => setSelectedEvent(
                        events[events.indexOf(selectedEvent) - 1] || null
                    )}>{i18n.t('Previous')}</Button>
                    <Button small secondary onClick={() => setSelectedEvent(
                        events[events.indexOf(selectedEvent) + 1] || null
                    )}>{i18n.t('Next')}</Button>
                </div>)}
            </div>

        </ModalComponent>
    );
}

export default EventModal;
