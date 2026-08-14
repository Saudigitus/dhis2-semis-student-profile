import React from 'react'
import ProfileSummaryCard from './ProfileSummaryCard';
import { useGetAttributes, useGetProgramIndicators } from 'dhis2-semis-functions';
import { useEnrollmentAnalytics } from '../../../hooks/analytics';
import useGetSelectedKeys from '../../../hooks/config/useGetSelectedKeys';

type AttributeItem = {
    id: string;
    displayName: string;
    unique?: boolean;
    required?: boolean;
    [key: string]: any;
};

function getUniqueRequiredAttributes(attributes: AttributeItem[]): AttributeItem[] {
    return attributes.filter((attr) => attr.unique === true && attr.required === true);
}

const SumarryCardComponent = ({ attributeValues }: { attributeValues: any }) => {
    const { program } = useGetSelectedKeys();
    const programId = program?.id;

    const { attributes } = useGetAttributes({ programData: program as any });

    const uniqueRequiredAttrs = getUniqueRequiredAttributes(attributes ?? []);

    function getAttributeValue() {
        //uniqueRequiredAttrs and attributeValues
        const uniqueRequiredAttributesValues: AttributeItem[] = [];
        uniqueRequiredAttrs?.map((attributeValue: AttributeItem) => {
            const attribute = attributeValues?.find((attribute: AttributeItem) => attribute.attribute === attributeValue.id);
            if (attribute) {
                uniqueRequiredAttributesValues.push([`${attribute.attribute}:IEQ:${attribute.value}`]);
            }
        });
        return uniqueRequiredAttributesValues;
    }

    const { programIndicators, loading: loadingIndicators } = useGetProgramIndicators({
        programId: programId ?? '',
        paging: false,
    });

    const indicatorIds = programIndicators.map((indicator) => indicator.id);

    const { rows, loading: loadingAnalytics } = useEnrollmentAnalytics({
        programId: programId ?? '',
        indicators: indicatorIds,
        filters: getAttributeValue() as any,
    });

    const loading = loadingIndicators || loadingAnalytics;

    if (loading) {
        return null;
    }

    const latestRow = rows[0] ?? {};

    return (
        <div style={{ display: "flex", gap: "16px" }}>
            {programIndicators.map((indicator) => (
                <ProfileSummaryCard
                    key={indicator.id}
                    value={latestRow[indicator.id] ?? ''}
                    label={indicator.displayName}
                    variant="info"
                />
            ))}
        </div>
    )
}

export default SumarryCardComponent