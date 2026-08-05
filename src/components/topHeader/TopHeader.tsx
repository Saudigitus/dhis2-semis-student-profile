import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import style from './TopHeader.module.css';

export interface TopHeaderProps {
    studentName?: string;
    i18n?: any;
    onBack?: () => void;
}

function TopHeader({ studentName, i18n, onBack }: TopHeaderProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/semis/enrollments' + location.search);
        }
    };

    const backText = i18n?.t ? i18n.t("Back to Enrollments") : "Back to Enrollments";
    const enrollmentText = i18n?.t ? i18n.t("Enrollment") : "Enrollment";
    const defaultStudentName = i18n?.t ? i18n.t("Student Profile") : "Student Profile";

    return (
        <div className={style.topHeaderContainer}>
            <button type="button" className={style.backButton} onClick={handleBack}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span>{backText}</span>
            </button>

            <span className={style.divider}>|</span>

            <div className={style.breadcrumb}>
                <span className={style.breadcrumbLabel}>{enrollmentText}</span>
                <span className={style.chevron}>›</span>
                <span className={style.studentName}>{studentName || defaultStudentName}</span>
            </div>
        </div>
    );
}

export default TopHeader;
