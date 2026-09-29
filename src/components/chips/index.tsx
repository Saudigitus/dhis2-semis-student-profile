import React, { useEffect, useState } from 'react'
import AcademicYearSelector from './AcademicYearSelector';
import { YearOption } from '../../types/chips/academicYearSelector';
import { useRecoilValue } from 'recoil';
import { SchoolCalendarData } from "dhis2-semis-components";
import { academicYear } from '../../utils/profile/formatAcademicYear';
import { useUrlParams } from "dhis2-semis-functions";
import { D2I18n } from 'dhis2-semis-types';


const AcademicYearSelectorComponent = ({ i18n }: { i18n: D2I18n }) => {
    const academicYearDataStore: any = useRecoilValue(SchoolCalendarData)
    const academicYearOptions: YearOption[] = academicYear(academicYearDataStore?.schoolCalendar)
    const { add, useQuery } = useUrlParams();
    const [selectedYear, setSelectedYear] = useState(academicYearOptions?.[0].code || "");
    const academicYearFromUrl = useQuery.get("academicYear");

    if (!academicYearFromUrl) {
        add("academicYear", selectedYear);
    }


    return (
        <AcademicYearSelector
            i18n={i18n}
            years={academicYearOptions}
            value={selectedYear}
            onChange={setSelectedYear}
        />
    )
}

export default AcademicYearSelectorComponent
