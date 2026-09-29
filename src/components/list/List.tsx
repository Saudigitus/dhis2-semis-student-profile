import styles from "./list.module.css";
import Loader from "../loader/Loader";
import { FunctionComponent } from "react";
import { D2I18n, ProgramConfig } from "dhis2-semis-types";
import { getDisplayName } from "dhis2-semis-components";

interface ListProps {
    i18n: D2I18n;
    loading?: string;
    data: {
        value?: string;
        attribute?: string;
        displayName?: string;
    }[];
    notRecorded?: string;
    programConfig?: ProgramConfig
}

const ListComponent: FunctionComponent<ListProps> = (props) => {
    const { i18n, data, notRecorded = "Not recorded", loading, programConfig } = props;

    if (loading) {
        return (
            <Loader i18n={i18n} />
        )
    }

    return (
        <>
            {data?.map((item) => {
                const isNotRecorded = !item?.value || item?.value === notRecorded;

                return (
                    <div key={item?.value} className={styles.row}>
                        <p className={styles.label}>{item?.displayName}</p>
                        <p className={isNotRecorded ? styles.valueNotRecorded : styles.value}>
                            {isNotRecorded
                                ? i18n.t(notRecorded)
                                : getDisplayName({ metaData: item?.attribute!, value: item?.value || '', program: programConfig! })
                            }
                        </p>
                    </div>
                );
            })}
        </>
    );
};

export default ListComponent;
