import { MetricCardProps } from "../../../types/card/profileSummaryCard";
import styles from "./profileSummaryCard.module.css";

const ProfileSummaryCard = (props: MetricCardProps) => {
    const { label, className, icon, value, variant = 'neutral' } = props;
    return (
        <div className={`${styles.card} ${styles[variant]} ${className}`}>
            {icon ? (
                <div className={styles.icon}>{icon}</div>
            ) : (
                <span className={styles.value}>{value}</span>
            )}
            <span className={styles.label}>{label}</span>
        </div>
    );
};

export default ProfileSummaryCard;