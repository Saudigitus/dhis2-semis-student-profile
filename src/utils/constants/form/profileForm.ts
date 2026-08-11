
function profileFormFields({ formFieldsData, sectionName }: { formFieldsData: any[], sectionName?: string }) {
    const [enrollmentDetails = [], studentsProfile = [], socioEconomicDetails = []] = formFieldsData;

    return [
        {
            name: "Student Profile",
            description: "Student personal details",
            visible: true,
            fields: [
                ...studentsProfile
            ]
        }
    ];
}

export { profileFormFields };
