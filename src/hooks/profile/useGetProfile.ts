import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useGetEvents, useGetTeis, useUrlParams } from 'dhis2-semis-functions';
import useGetSelectedKeys from '../config/useGetSelectedKeys';
import { profileDetails } from '../../schema/profile/profile-details';
import type { ProgramConfig, SchoolCalendarDataStoreRecord, selectedDataStoreKey } from 'dhis2-semis-types';
import { SchoolCalendarData } from 'dhis2-semis-components';
import { formatEnrollmentEvents, FormattedEvents } from '../../utils/profile/formatEnrollmentEvents';
import { useOrgUnitName } from '../orgUnit/useOrgUnitName';
import RefetchSchemaAtom from '../../schema/refetchSchema';
import { isFinalResultEnabled } from '../../utils/profile/buildProfileLayout';


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
    photoAttributeId?: string;
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
    );
}

// Who the person is, from the program metadata (SEMIS-248), with the same rules as the mobile app.
const TEXT_TYPES = ['TEXT', 'LONG_TEXT'];

export function resolveIdentity(
    program: ProgramConfig | undefined,
    attributes: AttributeListItem[] | undefined,
    finalResult?: { enabled: boolean; dataElement?: string; status?: any },
    trackedEntity?: string,
): ResolvedProfileFields {
    const programAttributes = program?.programTrackedEntityAttributes ?? [];
    const valueOf = (id?: string) => getAttributeValue(attributes, id);
    const inList = programAttributes.filter((item) => item.displayInList);

    // Name: text attributes shown in the list that are neither unique nor from an option set, in program order.
    const name = inList
        .filter(({ trackedEntityAttribute: attribute }) =>
            TEXT_TYPES.includes(attribute?.valueType) && !attribute?.unique && !attribute?.optionSet)
        .map(({ trackedEntityAttribute: attribute }) => valueOf(attribute?.id))
        .filter(Boolean)
        .join(' ');

    // Identifier: the unique attribute shown in the list, else the first unique attribute.
    const identifier = (inList.find(({ trackedEntityAttribute: attribute }) => attribute?.unique)
        ?? programAttributes.find(({ trackedEntityAttribute: attribute }) => attribute?.unique))?.trackedEntityAttribute?.id;

    const firstInList = inList.map(({ trackedEntityAttribute: attribute }) => valueOf(attribute?.id)).find(Boolean);

    // Tags: attributes whose options all have a colour, and the final decision of the year.
    const badges: ResolvedBadge[] = programAttributes
        .filter(({ trackedEntityAttribute: attribute }) => {
            const options = attribute?.optionSet?.options ?? [];
            return options.length > 0 && options.every((option: any) => option?.style?.color);
        })
        .filter(({ trackedEntityAttribute: attribute }) => valueOf(attribute?.id))
        .map(({ trackedEntityAttribute: attribute }, index) => ({
            order: index,
            source: 'ATTRIBUTE',
            styled: true,
            value: valueOf(attribute?.id),
            attributeId: attribute?.id,
        }));

    if (finalResult?.enabled) {
        badges.push({
            order: badges.length,
            source: 'FINAL_RESULT_STATUS',
            styled: true,
            value: finalResult.status?.value,
            attributeId: finalResult.dataElement,
        });
    }

    return {
        trackedEntity,
        title: name || firstInList || valueOf(identifier) || '',
        subtitle: valueOf(identifier) ?? '',
        photoAttributeId: programAttributes.find(({ trackedEntityAttribute: attribute }) => attribute?.valueType === 'IMAGE')
            ?.trackedEntityAttribute?.id,
        badges,
    };
}

export function useGetProfile() {
    const location = useLocation();
    const { getTeis } = useGetTeis();
    const { getEvents } = useGetEvents();
    const { urlParameters } = useUrlParams();
    const { academicYear, school } = urlParameters
    const { dataStoreData, program } = useGetSelectedKeys();
    const [loading, setLoading] = useState<boolean>(false);
    const refetch = useRecoilValue(RefetchSchemaAtom);
    const [events, setEvents] = useState<FormattedEvents>({});
    const [profileDetailsState, setProfileDetails] = useRecoilState(profileDetails);
    const schoolCalendarData = useRecoilValue(SchoolCalendarData);
    const { getOrgUnitNames, loading: orgUnitLoading, } = useOrgUnitName()


    const trackedEntity = location.pathname.split('/').filter(Boolean).pop();

    const attributes = useMemo<AttributeListItem[]>(
        () => profileDetailsState?.attributes ?? [],
        [profileDetailsState],
    );

    const fields = useMemo<ResolvedProfileFields>(
        () =>
            resolveIdentity(program, attributes, {
                enabled: isFinalResultEnabled(dataStoreData, program),
                dataElement: dataStoreData?.['final-result']?.status,
                status: getFinalResultStatusValue(academicYear!, dataStoreData, profileDetailsState?.enrollments, schoolCalendarData),
            }, trackedEntity),
        [program, attributes, dataStoreData, academicYear, trackedEntity, profileDetailsState?.enrollments, schoolCalendarData],
    );

    const studentName = fields.title;

    const getProfile = async () => {
        setEvents({});
        if (!trackedEntity || !dataStoreData?.program) return;

        try {
            setLoading(true);
            setProfileDetails([]);

            const event = await getEvents({
                program: dataStoreData.program,
                // trackedEntities: trackedEntity,
                orgUnit: school!,
                orgUnitMode: 'SELECTED',
                trackedEntity: trackedEntity,
                fields: '*',
                programStage: dataStoreData?.registration?.programStage,
                filter: [`${schoolCalendarData.academicYear}:in:${academicYear}`],
            })

            const teis = await getTeis({
                program: dataStoreData.program,
                trackedEntities: trackedEntity,
                fields: 'trackedEntity,enrollments[*,!attributes],attributes,trackedEntityType,orgUnit',
            } as any);

            if (teis?.[0]?.attributes) {
                setProfileDetails(teis[0]);
            }

            if (event?.length) {
                const currentAcademicYearEnrollment = teis?.[0]?.enrollments?.find((enrollment: any) =>
                    enrollment?.enrollment == event?.[0]?.enrollment)
                const ouName = await getOrgUnitNames([event?.[0]?.orgUnit]);
                setEvents(formatEnrollmentEvents(currentAcademicYearEnrollment || {}, ouName));
            }



        } catch (error) {
            console.error('Error fetching student profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProfile();
    }, [trackedEntity, academicYear, refetch]);

    return {
        studentName,
        loading: loading || orgUnitLoading,
        trackedEntity,
        attributes,
        fields,
        events,
    };
}