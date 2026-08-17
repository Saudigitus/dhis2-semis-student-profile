import styles from './modal.module.css'
import { FunctionComponent } from "react";
import { ModalComponent } from "dhis2-semis-components";
import ListComponent from "../../../components/list/List";
import { Button } from '@dhis2/ui';
import { CustomAttributeProps } from 'dhis2-semis-types';
import { format } from 'date-fns';

interface EventModalProps {
    i18n?: any,
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
            title={`${(title || 'Event details')} (${events.indexOf(selectedEvent) + 1}/${events.length})`}
        >
            <div className={styles.details}>
                <div className={styles.modalHeader}>
                    <div>
                        <div className={styles.stage}>Occurred at</div>
                        <div className={styles.date}>{format(new Date(selectedEvent?.occurredAt), 'yyyy-MM-dd')}</div>
                    </div>

                    <div className={styles.modalHeaderRight}>
                        <span className={styles.value}>{selectedEvent?.orgUnitName || selectedEvent?.orgUnit}</span>
                        <div className={`${styles.status} ${selectedEvent?.status === 'COMPLETED' ? styles.completed : styles.active}`}>
                            {selectedEvent?.status}
                        </div>
                    </div>
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
                    )}>Previous</Button>
                    <Button small secondary onClick={() => setSelectedEvent(
                        events[events.indexOf(selectedEvent) + 1] || null
                    )}>Next</Button>
                </div>)}
            </div>

        </ModalComponent>
    );
}

export default EventModal;