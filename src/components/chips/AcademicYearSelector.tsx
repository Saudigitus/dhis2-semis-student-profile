import styles from "./academicYearSelector.module.css";

export interface YearOption {
  order: number;
  label: string;
}

interface AcademicYearSelectorProps {
  years: YearOption[];
  value: string;
  onChange: (year: string) => void;
  label?: string;
  className?: string;
}

const AcademicYearSelector = ({
  years,
  value,
  onChange,
  label = "Academic year:",
  className = "",
}: AcademicYearSelectorProps) => {
  // Ordena pelos campos `order`
  const sortedYears = [...years].sort((a, b) => a.order - b.order);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <span className={styles.label}>{label}</span>

      <div className={styles.list}>
        {sortedYears.map((year) => (
          <button
            key={year.label}
            type="button"
            className={`${styles.item} ${value === year.label ? styles.itemActive : ""}`}
            onClick={() => onChange(year.label)}
          >
            {year.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AcademicYearSelector;