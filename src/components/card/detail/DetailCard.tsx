import { D2I18n } from "dhis2-semis-types";
import styles from "./detailCard.module.css";
import { FunctionComponent, ReactNode } from "react";

interface DetailCardProps {
    i18n?: D2I18n;
    title: string;
    badge: string;
    children: ReactNode;
    action?: {label: string, icon?: ReactNode, onClick?: () => void};
}

const DetailCard: FunctionComponent<DetailCardProps> = (props) => {
    const { i18n, title, badge, children, action } = props;
    const hasAction = Boolean(action?.label || action?.icon || action?.onClick);

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>{i18n.t(title)}</h3>
                <div className={styles.headerRight}>
                    <span className={styles.badge}>{i18n.t(badge)}</span>
                    {hasAction && (
                        <button
                            type="button"
                            onClick={action?.onClick}
                            className={styles.actionButton}
                        >
                            {action?.icon && <span className={styles.actionIcon}>{action.icon}</span>}
                            {action?.label && <span>{i18n.t(action.label)}</span>}
                        </button>
                    )}
                </div>
            </div>
            <div className={styles.body}>
                {children}
            </div>
        </div>
    );
};

export default DetailCard;