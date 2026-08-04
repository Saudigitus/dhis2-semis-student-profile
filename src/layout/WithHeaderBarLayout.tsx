import { Outlet } from "react-router-dom"
import { useConfig } from "@dhis2/app-runtime"
import useGetSelectedKeys from "../hooks/config/useGetSelectedKeys"
import { HeaderBarLayout, SemisHeader, useSchoolCalendarKey } from "dhis2-semis-components"

const WithHeaderBarLayout = () => {
    const { baseUrl } = useConfig()
    const schoolCalendar = useSchoolCalendarKey()
    const { program, dataStoreData } = useGetSelectedKeys()

    return (
        <HeaderBarLayout
            header={
                <SemisHeader
                    baseUrl={baseUrl}
                    program={program}
                    schoolCalendar={schoolCalendar}
                    dataStoreValues={dataStoreData as unknown as []}
                />
            }
        >
            <Outlet />
        </HeaderBarLayout>
    )
}

export default WithHeaderBarLayout