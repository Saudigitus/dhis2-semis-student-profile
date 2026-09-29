
import { D2I18n } from 'dhis2-semis-types';

function profileFormFields({ formFieldsData, sectionName, i18n }: { formFieldsData: any[], sectionName?: string, i18n: D2I18n }) {
    const [enrollmentDetails = [], studentsProfile = [], socioEconomicDetails = []] = formFieldsData;

    return [
        {
            name: i18n.t("Student Profile"),
            description: i18n.t("Student personal details"),
            visible: true,
            fields: [
                ...studentsProfile
            ]
        }
    ];
}

export { profileFormFields };
