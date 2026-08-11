import React from "react";
import { D2I18n } from 'dhis2-semis-types'
import TabPanel from "../../components/tabs/TabPanel";
import TestSumarryCard from "../../components/card/profileSummary/Test";
import TestAcademicYearSelector from "../../components/chips/Test";

export default function StudentProfile({ i18n, baseUrl }: { i18n: D2I18n, baseUrl: string }) {

    return (
        <div>
            <TestAcademicYearSelector />
            <div style={{ marginBottom: "15px" }} />
            <TestSumarryCard />
            <div style={{ marginBottom: "15px" }} />
            <TabPanel />
        </div>
    )
}