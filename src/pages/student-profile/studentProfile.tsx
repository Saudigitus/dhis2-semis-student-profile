import React, { useCallback, useState } from 'react';
import { D2I18n, Modules } from 'dhis2-semis-types';
import ProfileDetail from '../../components/profile-detail/ProfileDetail';
import { useGetProfile } from '../../hooks/profile/useGetProfile';
import TabPanel from "../../components/tabs/TabPanel";
import TestSumarryCard from "../../components/card/profileSummary/Test";
import TestAcademicYearSelector from "../../components/chips/Test";
import ModalManager from "../../components/modal/editProfile/ModalManager";
import { useBuildForm, useGetSectionTypeLabel } from 'dhis2-semis-functions';
import useGetSelectedKeys from '../../hooks/config/useGetSelectedKeys';
import { profileFormFields } from '../../utils/constants/form/profileForm';

export default function StudentProfile({ i18n, baseUrl }: { i18n: D2I18n, baseUrl: string }) {
    const { loading, fields } = useGetProfile();
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

    return (
        <>
            <div>
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
            </div>
            <div>
                <TestAcademicYearSelector />
                <div style={{ marginBottom: "15px" }} />
                <TestSumarryCard />
                <div style={{ marginBottom: "15px" }} />
                <TabPanel />
            </div>

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
        </>
    );
}
