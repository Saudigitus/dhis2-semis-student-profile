import styles from "./list.module.css";
import { FunctionComponent } from "react";
import { D2I18n } from "dhis2-semis-types";

interface ListProps {
    i18n: D2I18n;
    loading?: string;
    data: {
        displayName: string;
        value?: string;
    }[];
    notRecorded?: string;
}

const ListComponent: FunctionComponent<ListProps> = (props) => {
    const { i18n, data, notRecorded = "Not recorded", loading } = props;

    if (loading) {
        return (
            <div className={styles.loading}>Loading...</div>
        )
    }

    return (
        <>
            {data?.map((item) => {
                const isNotRecorded = !item.value || item.value === notRecorded;

                return (
                    <div key={item.value} className={styles.row}>
                        <p className={styles.label}>{item.displayName}</p>
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