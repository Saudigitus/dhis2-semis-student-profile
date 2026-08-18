import React, { useState } from 'react'
import { SchoolCalendarData, WithBorder, WithPadding } from 'dhis2-semis-components';
import { ModalManagerInterface } from 'src/types/modal/ModalProps';
import { Button, ButtonStrip, NoticeBox } from '@dhis2/ui';
import { useGetEvents, useGetSectionTypeLabel, useShowAlerts, useUploadEvents, useUrlParams } from 'dhis2-semis-functions';
import { profileDetails } from '../../../schema/profile/profile-details';
import { useRecoilState, useRecoilValue } from 'recoil';
import useGetSelectedKeys from '../../../../../../libs/components/src/hooks/config/useGetSelectedKeys';
import { format } from 'date-fns';
import RefetchSchemaAtom from '../../../schema/refetchSchema';


function ModalContent(props: ModalManagerInterface) {
    const { finalDecision, setOpen }: any = props
    const profileDetailsState = useRecoilValue(profileDetails);
    const { sectionName } = useGetSectionTypeLabel();
    const { useQuery } = useUrlParams();
    const { uploadValues } = useUploadEvents()
    const [refetch, setRefetch] = useRecoilState(RefetchSchemaAtom);

    const { getEvents } = useGetEvents()
    const academicYearFromUrl = useQuery.get("academicYear");
    const { dataStoreData } = useGetSelectedKeys();
    const { "final-result": finalResult, trackedEntityType } = dataStoreData as unknown as any || {}
    const academicYearDataStore: any = useRecoilValue(SchoolCalendarData)
    const [loading, setLoading] = useState(false)
    const { show, hide } = useShowAlerts()

    const handleConfirm = async () => {
        setLoading(true)
        let teis = []

        const rgEvents: any[] = await getEvents({
            program: profileDetailsState?.enrollments?.[0]?.program, fields: "*",
            trackedEntity: profileDetailsState?.enrollments?.[0]?.trackedEntity,
            programStage: dataStoreData?.registration?.programStage,
            filter: [`${[academicYearDataStore?.academicYear]}:IN:${academicYearFromUrl}`]
        })

        const frEvents: any[] = await getEvents({
            program: profileDetailsState?.enrollments?.[0]?.program, fields: "*",
            trackedEntity: profileDetailsState?.enrollments?.[0]?.trackedEntity,
            programStage: dataStoreData?.['final-result']?.programStage,
            enrollment: rgEvents?.[0]?.enrollment,
        })

        if (frEvents?.length > 0) {
            teis.push({
                orgUnit: frEvents?.[0]?.orgUnit,
                trackedEntityType: trackedEntityType,
                trackedEntity: frEvents?.[0]?.trackedEntity,
                enrollments: [
                    {
                        trackedEntity: frEvents?.[0]?.trackedEntity,
                        enrollment: frEvents?.[0]?.enrollment,
                        status: finalResult?.dropoutStatusValues?.includes(finalDecision.value) ? "CANCELLED" : "COMPLETED",
                        orgUnit: frEvents?.[0]?.orgUnit,
                        program: frEvents?.[0]?.program,
                        enrolledAt: frEvents?.[0]?.occurredAt,
                        occurredAt: frEvents?.[0]?.occurredAt,
                        trackedEntityType: trackedEntityType,
                        events: [
                            {
                                ...frEvents?.[0],
                                dataValues: [
                                    {
                                        dataElement: dataStoreData['final-result']?.status,
                                        value: finalDecision.value
                                    }
                                ]
                            }
                        ]
                    }
                ]
            })
        }
        else {
            teis.push({
                orgUnit: rgEvents?.[0]?.orgUnit,
                trackedEntity: rgEvents?.[0]?.trackedEntity,
                trackedEntityType: trackedEntityType,
                enrollments: [
                    {
                        orgUnit: rgEvents?.[0]?.orgUnit,
                        program: rgEvents?.[0]?.program,
                        trackedEntity: rgEvents?.[0]?.trackedEntity,
                        enrollment: rgEvents?.[0]?.enrollment,
                        trackedEntityType: trackedEntityType,
                        enrolledAt: format(new Date(), "yyyy-MM-dd"),
                        occurredAt: format(new Date(), "yyyy-MM-dd"),
                        status: finalResult?.dropoutStatusValues?.includes(finalDecision.value) ? "CANCELLED" : "COMPLETED",
                        events: [
                            {
                                orgUnit: rgEvents?.[0]?.orgUnit,
                                status: "COMPLETED",
                                program: rgEvents?.[0]?.orgUnit,
                                programStage: finalResult?.programStage,
                                occurredAt: format(new Date(), "yyyy-MM-dd"),
                                scheduledAt: format(new Date(), "yyyy-MM-dd"),
                                dataValues: [
                                    {
                                        dataElement: dataStoreData['final-result']?.status,
                                        value: finalDecision.value
                                    }
                                ]
                            }
                        ]
                    }
                ]
            })
        }
        await uploadValues({ trackedEntities: teis }, 'COMMIT', 'CREATE_AND_UPDATE')
            .then(() => {
                show({ message: `Successfully marked as ${finalDecision?.label} this ${sectionName.toLowerCase()}`, type: { success: true } })
                setLoading(false);
                setRefetch(!refetch)
                setOpen(false)
            })
            .catch(() => {
                setLoading(false);
                show({
                    message: `Could not update final decision for this ${sectionName.toLowerCase()}`,
                    type: { critical: true }
                });
                setTimeout(hide, 5000);
                setOpen(false)
            })
    }

    return (
        <WithPadding>
            <WithBorder type='all'>
                <WithPadding>
                    < NoticeBox
                        warning
                        title={`Are you sure you want to mark as ${finalDecision?.label} this 
                    ${sectionName.toLowerCase()}?`}
                    >
                        This will finalize the student's enrollment and record the selected final decision.
                    </NoticeBox>

                </WithPadding>
            </WithBorder>
            <ButtonStrip end className='mt-2'>
                <Button
                    disabled={loading}
                    loading={loading}
                    primary
                    onClick={handleConfirm}
                    type="button"
                    className="dhis2-uicore-button dhis2-uicore-button--primary"
                >
                    Confirm
                </Button>
                <Button
                    disabled={loading}
                    type="button"
                    className="dhis2-uicore-button dhis2-uicore-button--secondary"
                    onClick={props.setOpen.bind(null, false)}
                >
                    Cancel
                </Button>
            </ButtonStrip>
        </WithPadding>
    )
}

export default ModalContent
