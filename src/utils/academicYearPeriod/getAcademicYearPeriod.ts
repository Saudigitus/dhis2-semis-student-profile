const academicYearPeriod = (date: string, dataStoreSchoolCalendar: any): any => {
    const period = dataStoreSchoolCalendar?.schoolCalendar?.find((item: any) => item?.academicYear?.code === date)?.academicYear
    return {
        startDate: period?.startDate,
        endDate: period?.endDate
    }
}

export { academicYearPeriod }