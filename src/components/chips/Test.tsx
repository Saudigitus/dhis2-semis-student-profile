import React, { useState } from 'react'
import AcademicYearSelector, { YearOption } from './AcademicYearSelector';

const years: YearOption[] = [
    { order: 1, label: "2026" },
    { order: 2, label: "2025" },
    { order: 3, label: "2024" },
    { order: 4, label: "2023" },
];

// ou com labels mais complexos:
const years2: YearOption[] = [
    { order: 1, label: "2025/2026" },
    { order: 2, label: "2024/2025" },
    { order: 3, label: "2023/2024" },
];

const TestAcademicYearSelector = () => {
    const [selectedYear, setSelectedYear] = useState("2025/2026");

    return (
        <AcademicYearSelector
            years={years2}
            value={selectedYear}
            onChange={setSelectedYear}
        />
    )
}

export default TestAcademicYearSelector