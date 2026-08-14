import React from 'react'
import { WithBorder, WithPadding } from 'dhis2-semis-components';
import { ModalManagerInterface } from 'src/types/modal/ModalProps';
import { Button, ButtonStrip, NoticeBox } from '@dhis2/ui';
import { useGetEvents, useGetSectionTypeLabel, useUploadEvents } from 'dhis2-semis-functions';


function ModalContent(props: ModalManagerInterface) {
    const { finalDecision }: any = props
    const { sectionName } = useGetSectionTypeLabel();
    const { uploadValues } = useUploadEvents()
    const { getEvents } = useGetEvents()

    const handleConfirm = async () => {

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
                    primary
                    type="button"
                    className="dhis2-uicore-button dhis2-uicore-button--primary"
                >
                    Confirm
                </Button>
                <Button
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
