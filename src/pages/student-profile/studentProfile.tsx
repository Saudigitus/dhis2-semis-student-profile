import React, { useCallback } from 'react';
import { D2I18n } from 'dhis2-semis-types';
import ProfileDetail from '../../components/profile-detail/ProfileDetail';
import { useGetProfile } from '../../hooks/profile/useGetProfile';
import TabPanel from "../../components/tabs/TabPanel";
import styles from "./studentProfile.module.css"
import SumarryCardComponent from '../../components/card/profileSummary';
import AcademicYearSelectorComponent from '../../components/chips';

export default function StudentProfile({ i18n, baseUrl }: { i18n: D2I18n, baseUrl: string }) {
    const { loading, fields } = useGetProfile();

    const handleEdit = useCallback(() => {
        console.log('[StudentProfile] Edit profile requested');
    }, []);

    const handlePrintProfile = useCallback(() => {
        console.log('[StudentProfile] Print profile requested');
        if (typeof window !== 'undefined') {
            window.print();
        }
    }, []);

    const handleExportRecord = useCallback(() => {
        console.log('[StudentProfile] Export record requested');
    }, []);

    const handleMarkAsDropout = useCallback(() => {
        console.log('[StudentProfile] Mark as Dropout requested');
    }, []);

    const handleDeleteRecord = useCallback(() => {
        console.log('[StudentProfile] Delete record requested');
    }, []);

    return (
        <div className={styles.wrapper}>
            <ProfileDetail
                i18n={i18n}
                loading={loading}
                fields={fields}
                onEdit={handleEdit}
                onPrintProfile={handlePrintProfile}
                onExportRecord={handleExportRecord}
                onMarkAsDropout={handleMarkAsDropout}
                onDeleteRecord={handleDeleteRecord}
            />
            <AcademicYearSelectorComponent />
            <SumarryCardComponent />
            <TabPanel i18n={i18n} />
        </div>
    )
}