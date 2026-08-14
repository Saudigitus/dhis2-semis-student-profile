import styles from "./list.module.css";
import { FunctionComponent } from "react";
import { D2I18n } from "dhis2-semis-types";

interface ListProps {
    i18n: D2I18n;
    data: {
        name: string;
        value?: string;
    }[];
    columns: {
        label: string;
        value: string;
    }[];
    notRecorded?: string;
}

const ListComponent: FunctionComponent<ListProps> = (props) => {
    const { i18n, data, columns, notRecorded = "Not recorded", } = props;

    return (
        <>
            {data?.map((item) => {
                const isNotRecorded = !item.value || item.value === notRecorded;

                return (
                    <div key={item.value} className={styles.row}>
                        <p className={styles.label}>{columns?.find((col) => col?.value === item.name)?.label}</p>
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