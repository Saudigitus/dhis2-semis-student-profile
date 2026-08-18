interface profileUpdateBodyInterface {
    programId: string,
    orgUnitId: string,
    trackedEntityId: string,
    trackedEntityType: string,
    formValues: Record<string, any>,
    formVariablesFields: any[],
}

export const profileUpdateBody = ({
    formVariablesFields,
    trackedEntityId,
    trackedEntityType,
    orgUnitId,
    programId,
    formValues
}: profileUpdateBodyInterface): any => {
    const attributes: { attribute: string; value: any }[] = []

    for (const data of formVariablesFields) {
        if (!data || !data.length) continue;

        if (data[0]?.type === "attribute") {
            data.forEach((attribute: { id: string }) => {
                const value = formValues[attribute.id];
                if (value !== null && value !== undefined) {
                    attributes.push({ attribute: attribute.id, value });
                }
                else {
                    attributes.push({ attribute: attribute.id, value: "" });
                }
            })
        }
    }

    return {
        trackedEntities: [
            {
                orgUnit: orgUnitId,
                trackedEntity: trackedEntityId,
                trackedEntityType,
                attributes,
            }
        ]
    }
}
