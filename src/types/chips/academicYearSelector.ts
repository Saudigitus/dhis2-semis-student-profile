export interface YearOption {
    order: number;
    label: string;
    code: string;
}

interface AcademicYearSelectorProps {
    years: YearOption[];
    value: string;
    onChange: (year: string) => void;
    label?: string;
    className?: string;
}

export type { AcademicYearSelectorProps };