import React from 'react'
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ProfileSummaryCard from './ProfileSummaryCard';

const CARD_DATA = [
    {
        value: 12,
        label: "Absences",
        variant: "danger" as const,
    },
    {
        value: 14.2,
        label: "Avg grade",
        variant: "info" as const,
    },
    {
        value: "",
        label: "Risk of dropout",
        variant: "warning" as const,
        icon: <WarningAmberIcon sx={{ fontSize: 36 }} />,
    },
]

const SumarryCardComponent = () => {
    return (
        <div style={{ display: "flex", gap: "16px" }}>
            {CARD_DATA.map((card) => (
                <ProfileSummaryCard
                    key={card.label}
                    value={card.value}
                    label={card.label}
                    variant={card.variant}
                    icon={card.icon}
                />
            ))}
        </div>
    )
}

export default SumarryCardComponent