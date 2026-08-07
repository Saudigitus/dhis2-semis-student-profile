import { Outlet } from "react-router-dom"
import { Center, CircularLoader } from '@dhis2/ui'
import { HeaderBarLayout, TopHeader } from "dhis2-semis-components"
import { useGetProfile } from "../hooks/profile/useGetProfile"

const WithHeaderBarLayout = ({ baseUrl }: { baseUrl: string }) => {
    const { studentName, loading } = useGetProfile()


    if (loading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    return (
        <HeaderBarLayout
            header={
                <TopHeader
                    studentName={studentName}
                    type="student"
                />
            }
        >
            <Outlet />
        </HeaderBarLayout>
    )
}

export default WithHeaderBarLayout