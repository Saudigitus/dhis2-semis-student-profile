import React, { useCallback, useState } from 'react';
import { D2I18n, Modules } from 'dhis2-semis-types';
import ProfileDetail from '../../components/profile-detail/ProfileDetail';
import { useGetProfile } from '../../hooks/profile/useGetProfile';
import TabPanel from "../../components/tabs/TabPanel";
import ModalManager from "../../components/modal/editProfile/ModalManager";
import { useBuildForm, useGetSectionTypeLabel, useUrlParams } from 'dhis2-semis-functions';
import useGetSelectedKeys from '../../hooks/config/useGetSelectedKeys';
import { profileFormFields } from '../../utils/constants/form/profileForm';
import RecordsSummary from '../../components/card/profileSummary/RecordsSummary';
import AcademicYearSelectorComponent from '../../components/chips';
import styles from "./studentProfile.module.css";
import { Center, CircularLoader } from '@dhis2/ui';
import EventNoteIcon from '@mui/icons-material/EventNote';

export default function StudentProfile({ i18n, baseUrl }: { i18n: D2I18n, baseUrl: string }) {
    const { loading, fields, attributes, events, trackedEntity } = useGetProfile();
    const { dataStoreData, program } = useGetSelectedKeys();
    const { sectionName } = useGetSectionTypeLabel();
    const { formData } = useBuildForm({ dataStoreData, programData: program, module: Modules.Enrollment });
    const [openEditModal, setOpenEditModal] = useState<boolean>(false);
    const enrollmentFormFields = profileFormFields({ formFieldsData: formData, sectionName: sectionName!, i18n });
    const { useQuery } = useUrlParams();
    const academicYearFromUrl = useQuery.get("academicYear");


    const handleEdit = useCallback(() => {
        setOpenEditModal(true);
    }, []);

    const handlePrintProfile = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    }, []);

    const handleExportRecord = useCallback(() => {
    }, []);

    const handleMarkAsDropout = useCallback(() => {
    }, []);

    const handleDeleteRecord = useCallback(() => {
    }, []);

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
                hasEnrollment={Object.keys(events || {}).length > 0}
            />
            <AcademicYearSelectorComponent i18n={i18n} />
            {
                loading ? <Center><CircularLoader /></Center> :

                    !Object.keys(events || {}).length && !loading ?
                        <div className={styles.noRecordsCard}>
                            <div className={styles.noRecordsIcon}>
                                <EventNoteIcon color='primary' fontSize="large" />
                            </div>

                            <div className={styles.noRecordsContent}>
                                <h3>{i18n.t('No enrollment records for {{year}}', { year: academicYearFromUrl || '' })}</h3>

                                <p>
                                    {i18n.t('No enrollment information is available for this student in the selected academic year.')}
                                </p>
                            </div>
                        </div>
                        :
                        <div className={styles.profileSummary}>
                            <RecordsSummary i18n={i18n} events={events} />
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
