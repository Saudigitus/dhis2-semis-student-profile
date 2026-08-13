const academicYear = (dataStoreAcademicYear: any[]) => {
    const result = dataStoreAcademicYear
        .map(item => ({
            code: item.academicYear.code as string,
            label: item.academicYear.label as string,
        }))
        .sort((a, b) => b.code.localeCompare(a.code))
        .map((item, index) => ({
            ...item,
            order: Number(index + 1)
        }));

    return result;
}

export { academicYear }