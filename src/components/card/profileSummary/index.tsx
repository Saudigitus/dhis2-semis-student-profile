import React, { useMemo } from "react";
import ProfileSummaryCard from "./ProfileSummaryCard";
import {
    useGetAttributes,
    useGetProgramIndicators,
    useUrlParams,
} from "dhis2-semis-functions";
import { useEnrollmentAnalytics } from "../../../hooks/analytics";
import useGetSelectedKeys from "../../../hooks/config/useGetSelectedKeys";
import { useRecoilValue } from "recoil";
import { SchoolCalendarData } from "dhis2-semis-components";
import { academicYearPeriod } from "../../../utils/academicYearPeriod/getAcademicYearPeriod";
import Loader from "../../../components/loader/Loader";

type AttributeItem = {
    id: string;
    displayName: string;
    unique?: boolean;
    required?: boolean;
    [key: string]: any;
};

function getUniqueRequiredAttributes(
    attributes: AttributeItem[]
): AttributeItem[] {
    return attributes.filter(
        (attr) =>
            attr.unique === true &&
            attr.required === true
    );
}

const SumarryCardComponent = ({
    attributeValues,
}: {
    attributeValues: any;
}) => {
    const { program } = useGetSelectedKeys();

    const academicYearDataStore: any =
        useRecoilValue(SchoolCalendarData);

    const { useQuery } = useUrlParams();

    const academicYearFromUrl =
        useQuery.get("academicYear");

    const programId = program?.id ?? "";

    const { attributes } = useGetAttributes({
        programData: program as any,
    });

    const uniqueRequiredAttrs = useMemo(
        () =>
            getUniqueRequiredAttributes(
                attributes ?? []
            ),
        [attributes]
    );

    const academicPeriod = useMemo(() => {
        if (
            !academicYearFromUrl ||
            !academicYearDataStore
        ) {
            return undefined;
        }

        return academicYearPeriod(
            academicYearFromUrl,
            academicYearDataStore
        );
    }, [
        academicYearFromUrl,
        academicYearDataStore,
    ]);

    const enrollmentDate = useMemo(() => {
        if (
            !academicPeriod?.startDate ||
            !academicPeriod?.endDate
        ) {
            return "LAST_5_YEARS";
        }

        return `${academicPeriod.startDate}_${academicPeriod.endDate}`;
    }, [academicPeriod]);

    const {
        programIndicators,
        loading: loadingIndicators,
    } = useGetProgramIndicators({
        programId,
        paging: false,
    });

    const indicatorIds = useMemo(
        () =>
            programIndicators.map(
                (indicator) => indicator.id
            ),
        [programIndicators]
    );

    const filters = useMemo(() => {
        return uniqueRequiredAttrs.reduce(
            (result: string[], attribute) => {
                const value =
                    attributeValues?.find(
                        (item: AttributeItem) =>
                            item.attribute ===
                            attribute.id
                    );

                if (value) {
                    result.push(
                        `${value.attribute}:IEQ:${value.value}`
                    );
                }

                return result;
            },
            []
        );
    }, [
        uniqueRequiredAttrs,
        attributeValues,
    ]);

    const {
        rows,
        headers,
        loading: loadingAnalytics,
        error,
        refetch,
    } = useEnrollmentAnalytics({
        programId,
        indicators: indicatorIds,
        filters,
        enrollmentDate,
    });

    /**
     * Transforma:
     *
     * [
     *   ["Albion LBS", "43", "59", "..."]
     * ]
     *
     * em:
     *
     * {
     *   ouname: "Albion LBS",
     *   rsFMbajPSZO: "43",
     *   Ij2MYNsPU3S: "59"
     * }
     */
    const latestRow = useMemo(() => {
        const row = rows?.[0];

        if (!row || !headers.length) {
            return {};
        }

        return headers.reduce(
            (
                result: Record<string, any>,
                header,
                index
            ) => {
                result[header.name] = row[index];

                return result;
            },
            {}
        );
    }, [headers, rows]);

    const loading = loadingIndicators || loadingAnalytics;


    if (error) {
        return (
            <div>
                Error loading analytics
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                gap: "16px",
            }}
        >
            {programIndicators.map(
                (indicator) => (
                    <ProfileSummaryCard
                        key={indicator.id}
                        value={
                            latestRow[
                            indicator.id
                            ] ?? "N/A"
                        }
                        label={
                            indicator.displayName
                        }
                        variant="info"
                        loader={loading ? <Loader /> : null}
                    />
                )
            )}
        </div>
    );
};

export default SumarryCardComponent;