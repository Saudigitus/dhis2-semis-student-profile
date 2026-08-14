import { useDataQuery } from "@dhis2/app-runtime";

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
    rows: EnrollmentAnalyticsRow[];
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

function buildAnalyticsQuery(props: UseEnrollmentAnalyticsProps) {
    const {
        programId,
        indicators,
        orgUnit = "USER_ORGUNIT",
        filters = [],
        enrollmentDate = "LAST_5_YEARS",
        displayProperty = "SHORTNAME",
    } = props;

    const dimensions = [...indicators, `ou:${orgUnit}`, ...filters];

    return {
        results: {
            resource: `analytics/enrollments/query/${programId}`,
            params: {
                dimension: dimensions.join(","),
                headers: ["ouname", ...indicators, "enrollmentdate"].join(","),
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

export function useEnrollmentAnalytics(props: UseEnrollmentAnalyticsProps) {
    const query = buildAnalyticsQuery(props);

    const { data, loading, error, refetch } = useDataQuery<{ results: EnrollmentAnalyticsResponse }>(query);

    return {
        analytics: data?.results,
        headers: data?.results?.headers ?? [],
        rows: data?.results?.rows ?? [],
        metaData: data?.results?.metaData,
        loading,
        error,
        refetch,
    };
}

export type { EnrollmentAnalyticsHeader, EnrollmentAnalyticsRow, EnrollmentAnalyticsResponse, UseEnrollmentAnalyticsProps };
