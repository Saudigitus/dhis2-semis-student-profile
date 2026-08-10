import React from "react";
import { D2I18n } from 'dhis2-semis-types'
import TestSumarryCard from "../../components/card/profileSummary/Test";

export default function StudentProfile({ i18n, baseUrl }: { i18n: D2I18n, baseUrl: string }) {

    return (
        <div>
            <TestSumarryCard />
        </div>
    )
}