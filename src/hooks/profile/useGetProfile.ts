import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useGetTeis } from 'dhis2-semis-functions';
import useGetSelectedKeys from '../config/useGetSelectedKeys';
import { profileDetails } from '../../schema/profile/profile-details';

export type AttributeListItem = { attribute: string; value: any };

export type ProfileAttributeIds = {
    firstName?: string;
    surname?: string;
    systemId?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    guardian?: string;
    guardianContact?: string;
    distanceToSchool?: string;
    modeOfTransport?: string;
    foodProgramme?: string;
    disability?: string;
    orphanStatus?: string;
    householdIncome?: string;
    numberOfSiblings?: string;
    [key: string]: string | undefined;
};

export type ResolvedProfileFields = {
    trackedEntity?: string;
    fullName: string;
    systemId: string;
    gender: string;
    dateOfBirth: string;
    nationality: string;
    guardian: string;
    guardianContact: string;
    distanceToSchool: string;
    modeOfTransport: string;
    foodProgramme: string;
    disability: string;
    orphanStatus: string;
    householdIncome: string;
    numberOfSiblings: string;
};

export function getAttributeValue(
    attributes: AttributeListItem[] | undefined,
    attributeId?: string,
): any | undefined {
    if (!attributeId || !attributes) return undefined;
    const match = attributes.find((attr) => attr?.attribute === attributeId);
    return match?.value;
}

export function buildStudentName(
    attributes: AttributeListItem[],
    profile: ProfileAttributeIds | undefined,
    fallbackDisplay?: string,
): string {
    const nameAttrIds = [profile?.firstName, profile?.surname].filter(Boolean) as string[];
    const nameParts = nameAttrIds
        .map((id) => getAttributeValue(attributes, id))
        .filter(Boolean);

    return nameParts.join(' ') || fallbackDisplay || 'Student Profile';
}

export function resolveProfileFields(
    attributes: AttributeListItem[] | undefined,
    profileIds: ProfileAttributeIds | undefined,
    fallback?: { trackedEntity?: string; displayName?: string },
): ResolvedProfileFields {
    const safeAttributes = attributes ?? [];
    const notRecorded = 'Not recorded';

    return {
        trackedEntity: fallback?.trackedEntity,
        fullName: buildStudentName(safeAttributes, profileIds, fallback?.displayName),
        systemId:
            getAttributeValue(safeAttributes, profileIds?.systemId) ??
            fallback?.trackedEntity ??
            '—',
        gender: getAttributeValue(safeAttributes, profileIds?.gender) ?? notRecorded,
        dateOfBirth:
            getAttributeValue(safeAttributes, profileIds?.dateOfBirth) ?? notRecorded,
        nationality:
            getAttributeValue(safeAttributes, profileIds?.nationality) ?? notRecorded,
        guardian: getAttributeValue(safeAttributes, profileIds?.guardian) ?? notRecorded,
        guardianContact:
            getAttributeValue(safeAttributes, profileIds?.guardianContact) ?? notRecorded,
        distanceToSchool:
            getAttributeValue(safeAttributes, profileIds?.distanceToSchool) ?? notRecorded,
        modeOfTransport:
            getAttributeValue(safeAttributes, profileIds?.modeOfTransport) ?? notRecorded,
        foodProgramme:
            getAttributeValue(safeAttributes, profileIds?.foodProgramme) ?? notRecorded,
        disability: getAttributeValue(safeAttributes, profileIds?.disability) ?? notRecorded,
        orphanStatus:
            getAttributeValue(safeAttributes, profileIds?.orphanStatus) ?? notRecorded,
        householdIncome:
            getAttributeValue(safeAttributes, profileIds?.householdIncome) ?? notRecorded,
        numberOfSiblings:
            getAttributeValue(safeAttributes, profileIds?.numberOfSiblings) ?? notRecorded,
    };
}

export function useGetProfile() {
    const location = useLocation();
    const { getTeis } = useGetTeis();
    const { dataStoreData } = useGetSelectedKeys();
    const [loading, setLoading] = useState<boolean>(false);
    const [profileDetailsState, setProfileDetails] = useRecoilState(profileDetails);

    const trackedEntity = location.pathname.split('/').filter(Boolean).pop();
    const profileAttributeIds = useMemo<ProfileAttributeIds>(
        () => (dataStoreData?.profile ?? {}) as ProfileAttributeIds,
        [dataStoreData],
    );

    const attributes = useMemo<AttributeListItem[]>(
        () => profileDetailsState?.attributes ?? [],
        [profileDetailsState],
    );

    const studentName = useMemo(
        () =>
            buildStudentName(attributes, profileAttributeIds, profileDetailsState?.displayName),
        [attributes, profileAttributeIds, profileDetailsState?.displayName],
    );

    const fields = useMemo<ResolvedProfileFields>(
        () =>
            resolveProfileFields(attributes, profileAttributeIds, {
                trackedEntity,
                displayName: profileDetailsState?.displayName,
            }),
        [attributes, profileAttributeIds, trackedEntity, profileDetailsState?.displayName],
    );

    const getProfile = async () => {
        if (!trackedEntity || !dataStoreData?.program) return;

        try {
            setLoading(true);

            const teis = await getTeis({
                program: dataStoreData.program,
                trackedEntities: [trackedEntity],
                fields: 'trackedEntity,attributes[attribute,value],enrollments[enrollment,orgUnit,program,status,enrolledAt,occurredAt,events[dataValues[dataElement,value]]]',
            } as any);

            if (teis?.[0]?.attributes) {
                setProfileDetails(teis[0]);
            }
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
        profileAttributeIds,
        attributes,
        fields,
    };
}