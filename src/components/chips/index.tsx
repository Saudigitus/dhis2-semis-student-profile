import React, { useState } from 'react'
import AcademicYearSelector from './AcademicYearSelector';
import { YearOption } from '../../types/chips/academicYearSelector';

const years: YearOption[] = [
    { order: 1, label: "2026", code: "2026" },
    { order: 2, label: "2025", code: "2025" },
    { order: 3, label: "2024", code: "2024" },
    { order: 4, label: "2023", code: "2023" },
];

const years2: YearOption[] = [
    { order: 1, label: "2025/2026", code: "2025/2026" },
    { order: 2, label: "2024/2025", code: "2024/2025" },
    { order: 3, label: "2023/2024", code: "2023/2024" },
    { order: 3, label: "2023/2024", code: "2024/2023" },
    { order: 3, label: "2023/2024", code: "2023/2022" },
];

const AcademicYearSelectorComponent = () => {
    const [selectedYear, setSelectedYear] = useState("2025/2026");

    return (
        <AcademicYearSelector
            years={years2}
            value={selectedYear}
            onChange={setSelectedYear}
        />
    )
}

export default AcademicYearSelectorComponent