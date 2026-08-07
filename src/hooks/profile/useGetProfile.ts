import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { useGetTeis } from 'dhis2-semis-functions';
import useGetSelectedKeys from '../config/useGetSelectedKeys';
import { profileDetails } from '../../schema/profile/profile-details';

function buildStudentName(attributes: any[], profile: any): string {
    const nameAttrIds = [
        profile?.firstName,
        profile?.surname,
    ].filter(Boolean) as string[];

    const nameParts = nameAttrIds
        .map((id) => attributes.find((attr: any) => attr.attribute === id)?.value)
        .filter(Boolean);

    return nameParts.join(' ') || 'Student Profile';
}

export function useGetProfile() {
    const location = useLocation();
    const { getTeis } = useGetTeis();
    const { dataStoreData } = useGetSelectedKeys();
    const [studentName, setStudentName] = useState<string>('Student Profile');
    const [loading, setLoading] = useState<boolean>(false);
    const [profileDetailsState, setProfileDetails] = useRecoilState(profileDetails);

    const trackedEntity = location.pathname.split('/').filter(Boolean).pop();

    const getProfile = async () => {
        if (!trackedEntity || !dataStoreData?.program) return;

        try {
            setLoading(true);

            const teis = await getTeis({
                program: dataStoreData.program,
                trackedEntities: [trackedEntity],
                fields: 'trackedEntity,attributes[attribute,value]',
            } as any);

            const tei = teis?.[0];
            if (tei?.attributes) {
                setProfileDetails(tei);
                setStudentName(buildStudentName(tei.attributes, dataStoreData?.profile));
            }
        } catch (error) {
            console.error('Error fetching student profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Skip fetch if profileDetails already has data for this TEI
        if (profileDetailsState?.trackedEntity === trackedEntity) {
            const cachedAttrs = profileDetailsState.attributes ?? [];
            setStudentName(buildStudentName(cachedAttrs, dataStoreData?.profile));
            return;
        }

        getProfile();
    }, [trackedEntity]);

    return { studentName, loading };
}
