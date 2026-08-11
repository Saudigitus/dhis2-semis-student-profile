import { useEffect } from "react";
import { AcademicYearSelectorProps, YearOption } from "../../types/chips/academicYearSelector";
import styles from "./academicYearSelector.module.css";
//@ts-ignore
import { useUrlParams } from "dhis2-semis-functions";


const AcademicYearSelector = (props: AcademicYearSelectorProps) => {
    const { onChange, value, years, className, label = 'Academic year:' } = props
    const sortedYears = [...years].sort((a, b) => a.order - b.order);
    const { add, useQuery } = useUrlParams()
    const academicYearFromUrl = useQuery.get('academicYear');

    useEffect(() => {
        if (!academicYearFromUrl) return;
        const matchedYear = years.find((year) => year.code === academicYearFromUrl);
        if (matchedYear && matchedYear.label !== value) {
            onChange(matchedYear.label);
        }
    }, [academicYearFromUrl, years, value, onChange]);

    const handleClick = (year: YearOption) => {
        onChange(year.label);
        add("academicYear", year.code);
    };

    return (
        <div className={`${styles.wrapper} ${className}`}>
            <span className={styles.label}>{label}</span>
            <div className={styles.list}>
                {sortedYears.map((year) => (
                    <button
                        key={year.label}
                        type="button"
                        className={`${styles.item} ${value === year.label ? styles.itemActive : ""}`}
                        onClick={() => handleClick(year)}
                    >
                        {year.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AcademicYearSelector;