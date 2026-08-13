import styles from "./list.module.css";
import { FunctionComponent } from "react";
import { D2I18n } from "dhis2-semis-types";

interface Item {
    label: string;
    value?: string;
}

interface ListProps {
    i18n: D2I18n;
    items: Item[];
    notRecorded?: string;
}

const ListComponent: FunctionComponent<ListProps> = (props) => {
    const { i18n, items, notRecorded = "Not recorded", } = props;

    return (
        <>
            {items?.map((item) => {
                const isNotRecorded = !item.value || item.value === notRecorded;

                return (
                    <div key={item.label} className={styles.row}>
                        <p className={styles.label}>{item.label}</p>
                        <p className={isNotRecorded ? styles.valueNotRecorded : styles.value}>
                            {isNotRecorded ? i18n.t(notRecorded) : item.value}
                        </p>
                    </div>
                );
            })}
        </>
    );
};

export default ListComponent;