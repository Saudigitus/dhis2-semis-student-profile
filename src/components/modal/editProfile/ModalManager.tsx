import React, { useEffect, useState } from "react";
import ModalContent from "./ModalContent";
import { ModalManagerInterface } from "../../../types/modal/ModalProps";
import useGetSelectedKeys from "../../../hooks/config/useGetSelectedKeys";
import { ModalComponent } from "dhis2-semis-components";
import { profileUpdateBody } from "../../../utils/profile/formatProfileUpdateBody";
import { useGetAttributes, useGetPatternCode, useSaveTei, useGetSectionTypeLabel, RulesEngine } from "dhis2-semis-functions";
import { useRecoilState, useRecoilValue } from "recoil";
import { profileDetails } from "../../../schema/profile/profile-details";
import RefetchSchemaAtom from "../../../schema/refetchSchema";

function ModalManager(props: ModalManagerInterface) {
    const { saveTei, loading: saving } = useSaveTei();
    const { sectionName } = useGetSectionTypeLabel();
    const { program: programData, dataStoreData } = useGetSelectedKeys();
    const [refetch, setRefetch] = useRecoilState(RefetchSchemaAtom);
    const { attributes = [] } = useGetAttributes({ programData: programData! });
    const { errorLoading, loadingCodes, generatedVariables } = useGetPatternCode();
    const { open, setOpen, formFields = [], formVariablesFields, i18n } = props;
    const [initialValues, setInitialValues] = useState<{ [key: string]: any }>({});
    const profileDetailsState = useRecoilValue(profileDetails);
    const trackedEntity = profileDetailsState?.trackedEntity;

    const [values, setValues] = useState<{ [key: string]: any }>({});

    const { runRulesEngine, updatedVariables } = RulesEngine({
        values: values,
        variables: formFields,
        program: programData!.id,
        type: "programStageSection",
    });

    useEffect(() => {
        runRulesEngine({ overrideVariables: formFields, overrideValues: values });
    }, [values]);

    useEffect(() => {
        if (open && profileDetailsState?.attributes) {
            const attributesMap: Record<string, any> = {};
            profileDetailsState.attributes.forEach((attr: { attribute: string; value: any }) => {
                attributesMap[attr.attribute] = attr.value;
            });
            setValues(attributesMap);
            setInitialValues(attributesMap);
        }
    }, [open, profileDetailsState]);

    useEffect(() => {
        return () => {
            if (!open) {
                setValues({});
            }
        };
    }, [open]);

    const handleCloseModal = () => setOpen(false);

    const handleChange = (e: { field: any; value: string; name: string }) => {
        // Handled by CustomForm
    };

    function onSubmit(e: Record<string, any>): void {
        const data = profileUpdateBody({
            formVariablesFields: formVariablesFields,
            trackedEntityId: trackedEntity!,
            trackedEntityType: programData?.trackedEntityType?.id!,
            orgUnitId: profileDetailsState?.enrollments?.[0]?.orgUnit,
            programId: programData?.id!,
            formValues: e,
        });

        saveTei({
            data: data,
            messages: {
                error: `${i18n.t("Could not conclude the operation.")}`,
                sucess: `${i18n.t("Operation concluded successfully")}`,
            },
            handleComplete: () => {
                handleCloseModal();
                setRefetch(!refetch)
            },
        });
    }

    if (errorLoading) {
        handleCloseModal();
        return null;
    }

    return (
        <ModalComponent
            open={open}
            handleClose={handleCloseModal}
            loading={loadingCodes}
            title={i18n.t('Edit Student Profile')}
        >
            <ModalContent
                loading={saving!}
                onSubmit={onSubmit}
                formValues={values}
                onChange={handleChange}
                setFormValues={setValues}
                onCancel={handleCloseModal}
                formFields={updatedVariables}
                trackedEntity={trackedEntity}
                initialValues={{
                    ...initialValues,
                    ...generatedVariables,
                }}
            />
        </ModalComponent>
    );
}

export default ModalManager;
