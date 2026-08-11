import { VariablesTypes } from "dhis2-semis-types";

function profileFormFields({ formFieldsData, sectionName }: { formFieldsData: any[], sectionName?: string }) {
    const [profileFields = []] = formFieldsData;

    return [
        {
            name: "Student Profile",
            description: "Student personal details",
            visible: true,
            fields: [
                ...profileFields
            ]
        }
    ];
}

export { profileFormFields };
