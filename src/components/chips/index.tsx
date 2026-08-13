import React, { useEffect, useState } from 'react'
import AcademicYearSelector from './AcademicYearSelector';
import { YearOption } from '../../types/chips/academicYearSelector';
import { useRecoilValue } from 'recoil';
import { SchoolCalendarData } from "dhis2-semis-components";
import { academicYear } from '../../utils/profile/formatAcademicYear';
import { useUrlParams } from "dhis2-semis-functions";


const AcademicYearSelectorComponent = () => {
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
            years={academicYearOptions}
            value={selectedYear}
            onChange={setSelectedYear}
        />
    )
}

export default AcademicYearSelectorComponent