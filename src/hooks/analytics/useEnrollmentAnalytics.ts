import { useCallback, useEffect, useMemo, useState } from "react";
import { useDataEngine } from "@dhis2/app-runtime";

type EnrollmentAnalyticsHeader = {
    name: string;
    displayName: string;
    valueType: string;
    type: string;
};

type EnrollmentAnalyticsRow = {
    [key: string]: string | number;
};

type EnrollmentAnalyticsResponse = {
    headers: EnrollmentAnalyticsHeader[];
    rows: any[];
    metaData?: {
        items?: Record<string, { name: string; displayName: string }>;
        dimensions?: Record<string, string[]>;
    };
    width?: number;
    height?: number;
};

type UseEnrollmentAnalyticsProps = {
    programId: string;
    indicators: string[];
    orgUnit?: string;
    filters?: string[];
    enrollmentDate?: string;
    displayProperty?: string;
};

function buildAnalyticsQuery(
    props: UseEnrollmentAnalyticsProps
) {
    const {
        programId,
        indicators,
        orgUnit = "USER_ORGUNIT",
        filters = [],
        enrollmentDate = "LAST_5_YEARS",
        displayProperty = "SHORTNAME",
    } = props;

    const dimensions = [
        ...indicators,
        `ou:${orgUnit}`,
        ...filters,
    ];

    return {
        results: {
            resource: `analytics/enrollments/query/${programId}`,
            params: {
                dimension: dimensions.join(","),
                headers: [
                    "ouname",
                    ...indicators,
                    "enrollmentdate",
                ].join(","),
                totalPages: false,
                rowContext: true,
                enrollmentDate,
                displayProperty,
                includeMetadataDetails: true,
                outputType: "ENROLLMENT",
            },
        },
    };
}

export function useEnrollmentAnalytics(
    props: UseEnrollmentAnalyticsProps
) {
    const engine = useDataEngine();

    const [data, setData] =
        useState<EnrollmentAnalyticsResponse | null>(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] =
        useState<Error | null>(null);

    /**
     * Criamos uma chave estável para identificar
     * quando os parâmetros realmente mudaram.
     */
    const queryKey = useMemo(
        () =>
            JSON.stringify({
                programId: props.programId,
                indicators: props.indicators,
                orgUnit: props.orgUnit,
                filters: props.filters,
                enrollmentDate: props.enrollmentDate,
                displayProperty: props.displayProperty,
            }),
        [
            props.programId,
            props.indicators,
            props.orgUnit,
            props.filters,
            props.enrollmentDate,
            props.displayProperty,
        ]
    );

    const query = useMemo(
        () => buildAnalyticsQuery(props),
        [queryKey]
    );

    const fetchData = useCallback(async () => {
        if (
            !props.programId ||
            !props.indicators.length
        ) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response =
                await engine.query<{
                    results: EnrollmentAnalyticsResponse;
                }>(query);

            setData(response.results);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [
        engine,
        query,
        props.programId,
        props.indicators.length,
    ]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        analytics: data,
        headers: data?.headers ?? [],
        rows: data?.rows ?? [],
        metaData: data?.metaData,
        loading,
        error,
        refetch: fetchData,
    };
}