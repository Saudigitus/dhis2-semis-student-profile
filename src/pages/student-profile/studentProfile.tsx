import React, { useCallback, useState } from 'react';
import { D2I18n, Modules } from 'dhis2-semis-types';
import ProfileDetail from '../../components/profile-detail/ProfileDetail';
import { useGetProfile } from '../../hooks/profile/useGetProfile';
import TabPanel from "../../components/tabs/TabPanel";
import ModalManager from "../../components/modal/editProfile/ModalManager";
import { useBuildForm, useGetSectionTypeLabel } from 'dhis2-semis-functions';
import useGetSelectedKeys from '../../hooks/config/useGetSelectedKeys';
import { profileFormFields } from '../../utils/constants/form/profileForm';
import SumarryCardComponent from '../../components/card/profileSummary';
import AcademicYearSelectorComponent from '../../components/chips';
import styles from "./studentProfile.module.css";
import { Center, CircularLoader } from '@dhis2/ui';

export default function StudentProfile({ i18n, baseUrl }: { i18n: D2I18n, baseUrl: string }) {
    const { loading, fields, attributes, events, trackedEntity } = useGetProfile();
    const { dataStoreData, program } = useGetSelectedKeys();
    const { sectionName } = useGetSectionTypeLabel();
    const { formData } = useBuildForm({ dataStoreData, programData: program, module: Modules.Enrollment });
    const [openEditModal, setOpenEditModal] = useState<boolean>(false);
    const enrollmentFormFields = profileFormFields({ formFieldsData: formData, sectionName: sectionName! });

    const handleEdit = useCallback(() => {
        setOpenEditModal(true);
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

    console.log(events, "events")

    return (
        <div className={styles.wrapper}>
            <ProfileDetail
                i18n={i18n}
                loading={loading}
                fields={fields}
                trackedEntity={trackedEntity}
                program={dataStoreData?.program}
                onEdit={handleEdit}
                onPrintProfile={handlePrintProfile}
                onExportRecord={handleExportRecord}
                onMarkAsDropout={handleMarkAsDropout}
                onDeleteRecord={handleDeleteRecord}
            />
            <AcademicYearSelectorComponent />
            {
                loading ? <Center><CircularLoader /></Center> :

                    !Object.keys(events || {}).length && !loading ?
                        <div className={styles.noRecords}>
                            No enrollment records found for the selected academic year.
                        </div>
                        :
                        <div className={styles.profileSummary}>
                            <SumarryCardComponent
                                attributeValues={attributes}
                            />
                            <TabPanel
                                i18n={i18n}
                                events={events}
                                loading={loading}
                                attributes={attributes}
                            />
                        </div>
            }

            {openEditModal && (
                <ModalManager
                    i18n={i18n}
                    saveMode="UPDATE"
                    open={openEditModal}
                    setOpen={setOpenEditModal}
                    formFields={enrollmentFormFields}
                    formVariablesFields={formData}
                />
            )}
        </div>
    );
}
