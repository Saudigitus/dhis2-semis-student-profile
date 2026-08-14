import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useGetTeis, useUrlParams } from 'dhis2-semis-functions';
import useGetSelectedKeys from '../config/useGetSelectedKeys';
import { profileDetails } from '../../schema/profile/profile-details';
import type { SchoolCalendarDataStoreRecord, selectedDataStoreKey } from 'dhis2-semis-types';
import { SchoolCalendarData } from 'dhis2-semis-components';
import { formatEnrollmentEvents } from '../../utils/profile/formatEnrollmentEvents';
import { useOrgUnitName } from '../orgUnit/useOrgUnitName';

type IdentityCard = NonNullable<selectedDataStoreKey['profile']>['identityCard'];
type IdentityBadge = IdentityCard['badges'][number];

export type AttributeListItem = { attribute: string; value: any };

export type ResolvedBadge = {
    order: number;
    source: string;
    styled: boolean;
    value?: string;
    attributeId?: string;
};

export type ResolvedProfileFields = {
    trackedEntity?: string;
    title: string;
    subtitle: string;
    photoUrl?: string;
    badges: ResolvedBadge[];
};

export function getAttributeValue(
    attributes: AttributeListItem[] | undefined,
    attributeId?: string,
): any | undefined {
    if (!attributeId || !attributes) return undefined;
    const match = attributes.find((attr) => attr?.attribute === attributeId);
    return match?.value;
}

export function getFinalResultStatusValue(
    academicYear?: string,
    dataStoreData?: selectedDataStoreKey,
    enrollmentData?: any[],
    schoolCalendarData?: SchoolCalendarDataStoreRecord,
): string | undefined {

    const finalResult = dataStoreData?.['final-result'];
    const registration = dataStoreData?.registration;
    const academicYearId = schoolCalendarData?.academicYear

    const enrollment = enrollmentData?.find(({ events }: any) =>
        events?.some((event: any) => {
            const matchesRegistrationStage =
                event.programStage === registration.programStage;

            const matchesAcademicYear = event.dataValues?.some(
                (dataValue: any) =>
                    dataValue.dataElement === academicYearId &&
                    dataValue.value === academicYear,
            );

            return matchesRegistrationStage && matchesAcademicYear;
        }),
    );

    if (!enrollment) {
        return undefined;
    }

    const finalResultEvent = enrollment.events?.find(
        ({ programStage }: any) =>
            programStage === finalResult.programStage,
    );

    return finalResultEvent?.dataValues?.find(
        ({ dataElement }: any) =>
            dataElement === finalResult?.status,
    )?.value;
}

export function resolveTextFromConfig(
    attributes: AttributeListItem[] | undefined,
    config: { attributes: string[]; separator: string } | undefined,
    fallback?: string,
): string {
    if (!config?.attributes?.length) return fallback ?? '';
    const values = config.attributes
        .map((id) => getAttributeValue(attributes, id))
        .filter(Boolean);
    return values.length > 0 ? values.join(config.separator ?? ' ') : fallback ?? '';
}

export function resolveBadges(
    attributes: AttributeListItem[] | undefined,
    badges: IdentityBadge[] | undefined,
    finalResultStatus?: string,
): ResolvedBadge[] {
    if (!badges?.length) return [];

    return [...badges]
        .sort((a, b) => a.order - b.order)
        .map((badge) => {
            let value: string | undefined;

            if (badge.source === 'FINAL_RESULT_STATUS') {
                value = finalResultStatus;
            } else if (badge.source === 'ATTRIBUTE' && badge.variable) {
                value = getAttributeValue(attributes, badge.variable);
            }

            return {
                order: badge.order,
                source: badge.source,
                styled: badge.styled,
                value,
                attributeId: badge.variable,
            };
        });
}

export function resolveProfileFields(
    attributes: AttributeListItem[] | undefined,
    identityCard: IdentityCard | undefined,
    finalResultStatus?: string,
    fallback?: { trackedEntity?: string; displayName?: string },
): ResolvedProfileFields {
    const safeAttributes = attributes ?? [];

    return {
        trackedEntity: fallback?.trackedEntity,
        title: resolveTextFromConfig(safeAttributes, identityCard?.title, fallback?.displayName),
        subtitle: resolveTextFromConfig(safeAttributes, identityCard?.subtitle, fallback?.trackedEntity),
        photoUrl: getAttributeValue(safeAttributes, identityCard?.photo?.attribute),
        badges: resolveBadges(safeAttributes, identityCard?.badges || [], finalResultStatus),
    };
}

export function useGetProfile() {
    const location = useLocation();
    const { getTeis } = useGetTeis();
    const { urlParameters } = useUrlParams();
    const { academicYear } = urlParameters
    const { dataStoreData } = useGetSelectedKeys();
    const [loading, setLoading] = useState<boolean>(false);
    const [profileDetailsState, setProfileDetails] = useRecoilState(profileDetails);
    const schoolCalendarData = useRecoilValue(SchoolCalendarData);
    const { orgUnitNames, getOrgUnitNames, loading: orgUnitLoading, } = useOrgUnitName()


    const trackedEntity = location.pathname.split('/').filter(Boolean).pop();

    const identityCard = useMemo<IdentityCard | undefined>(
        () => dataStoreData?.profile?.identityCard as IdentityCard | undefined,
        [dataStoreData],
    );

    const attributes = useMemo<AttributeListItem[]>(
        () => profileDetailsState?.attributes ?? [],
        [profileDetailsState],
    );

    const studentName = useMemo(
        () => resolveTextFromConfig(attributes, identityCard?.title, profileDetailsState?.displayName),
        [attributes, identityCard, profileDetailsState?.displayName],
    );

    const fields = useMemo<ResolvedProfileFields>(
        () =>
            resolveProfileFields(attributes, identityCard, getFinalResultStatusValue(academicYear!, dataStoreData, profileDetailsState?.enrollments, schoolCalendarData), {
                trackedEntity,
                displayName: profileDetailsState?.displayName,
            }),
        [attributes, identityCard, academicYear, trackedEntity, profileDetailsState?.displayName],
    );

    const getProfile = async () => {
        if (!trackedEntity || !dataStoreData?.program) return;

        try {
            setLoading(true);

            const teis = await getTeis({
                program: dataStoreData.program,
                trackedEntities: [trackedEntity],
                fields: 'enrollments[*,!attributes],attributes',
            } as any);

            if (teis?.[0]?.attributes) {
                setProfileDetails(teis[0]);
            }

            await getOrgUnitNames(
                profileDetailsState?.enrollments?.map((enrollment: any) => enrollment.orgUnit)
                    ?.filter(Boolean)
                    ?.filter(
                        (
                            orgUnit: string,
                            index: number,
                            array: string[]
                        ) => array.indexOf(orgUnit) === index
                    ) || []
                || []);

        } catch (error) {
            console.error('Error fetching student profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profileDetailsState?.trackedEntity === trackedEntity) {
            return;
        }

        getProfile();
    }, [trackedEntity]);

    return {
        studentName,
        loading,
        trackedEntity,
        identityCard,
        attributes,
        fields,
        events: formatEnrollmentEvents(profileDetailsState?.enrollments?.[0] || {}, orgUnitNames),
    };
}