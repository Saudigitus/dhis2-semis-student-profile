import { useEffect, useRef, useState } from "react";
import { AcademicYearSelectorProps, YearOption } from "../../types/chips/academicYearSelector";
import styles from "./academicYearSelector.module.css";
import { useUrlParams } from "dhis2-semis-functions";
import { Button, Menu, MenuItem, Popover } from "@dhis2/ui";

const AcademicYearSelector = (props: AcademicYearSelectorProps) => {
    const { onChange, value, years, className, i18n,
        label = i18n.t("Academic year:"), maxVisible = 5 } = props;

    const { add, useQuery } = useUrlParams();
    const academicYearFromUrl = useQuery.get("academicYear");

    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const moreOptionsRef = useRef<HTMLDivElement | null>(null);

    // Garante que o ano selecionado sempre apareça nas opções visíveis
    const getVisibleAndHidden = () => {
        const selectedIndex = years.findIndex((y) => y.label === value);

        // Se o selecionado está dentro dos primeiros maxVisible → comportamento normal
        if (selectedIndex === -1 || selectedIndex < maxVisible) {
            return {
                visible: years.slice(0, maxVisible),
                hidden: years.slice(maxVisible),
            };
        }

        // Selecionado está oculto → traz ele para a lista visível
        // (mostra os primeiros maxVisible-1 + o selecionado)
        const visible = [
            ...years.slice(0, maxVisible - 1),
            years[selectedIndex],
        ];

        const hidden = years.filter(
            (y) => !visible.some((v) => v.code === y.code)
        );

        return { visible, hidden };
    };

    const { visible: visibleYears, hidden: hiddenYears } = getVisibleAndHidden();
    const hasMore = hiddenYears.length > 0;

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
        setMoreMenuOpen(false);
    };

    return (
        <div className={`${styles.wrapper} ${className}`}>
            <span className={styles.label}>{label}</span>

            <div className={styles.list}>
                {visibleYears.map((year) => (
                    <button
                        key={year.code}
                        type="button"
                        className={`${styles.item} ${value === year.label ? styles.itemActive : ""
                            }`}
                        onClick={() => handleClick(year)}
                    >
                        {year.label}
                    </button>
                ))}

                {hasMore && (
                    <>
                        <div ref={moreOptionsRef}>
                            <Button
                                small
                                onClick={() => setMoreMenuOpen((open) => !open)}
                            >
                                {i18n.t('More')}
                            </Button>
                        </div>

                        {moreMenuOpen && (
                            <Popover
                                reference={moreOptionsRef}
                                onClickOutside={() => setMoreMenuOpen(false)}
                                placement="bottom-end"
                            >
                                <Menu dense>
                                    {hiddenYears.map((year) => (
                                        <MenuItem
                                            key={year.code}
                                            label={year.label}
                                            onClick={() => handleClick(year)}
                                        />
                                    ))}
                                </Menu>
                            </Popover>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AcademicYearSelector;
