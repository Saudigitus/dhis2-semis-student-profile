import { ReactNode } from "react";

type MetricCardVariant = "danger" | "info" | "warning" | "success" | "neutral";

interface MetricCardProps {
    value?: string | number;
    label: string;
    variant?: MetricCardVariant;
    icon?: ReactNode;
    className?: string;
    loader?: ReactNode;
}

export type { MetricCardProps, MetricCardVariant };