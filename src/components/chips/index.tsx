import React, { useState } from 'react'
import AcademicYearSelector from './AcademicYearSelector';
import { YearOption } from '../../types/chips/academicYearSelector';
import { useRecoilValue } from 'recoil';
//@ts-ignore
import { SchoolCalendarData } from "dhis2-semis-components";
import { academicYear } from '../../utils/profile/formatAcademicYear';

const AcademicYearSelectorComponent = () => {
    const academicYearDataStore: any = useRecoilValue(SchoolCalendarData)
    const academicYearOptions: YearOption[] = academicYear(academicYearDataStore?.schoolCalendar)
    const [selectedYear, setSelectedYear] = useState(academicYearOptions?.[0].code || "");

    return (
        <AcademicYearSelector
            years={academicYearOptions}
            value={selectedYear}
            onChange={setSelectedYear}
        />
    )
}

export default AcademicYearSelectorComponent