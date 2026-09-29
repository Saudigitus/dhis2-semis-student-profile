import { D2I18n } from 'dhis2-semis-types';

export interface YearOption {
    order: number;
    label: string;
    code: string;
}

interface AcademicYearSelectorProps {
    i18n: D2I18n;
    years: YearOption[];
    value: string;
    onChange: (year: string) => void;
    label?: string;
    className?: string;
    maxVisible?: number;
}

export type { AcademicYearSelectorProps };
