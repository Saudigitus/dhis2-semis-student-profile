import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Center, CircularLoader } from '@dhis2/ui'
import { HeaderBarLayout, TopHeader } from "dhis2-semis-components"
import { useGetProfile } from "../hooks/profile/useGetProfile"
import { useDataStore } from "../hooks/wrapper/useDataStore"
import { useEffect } from "react"
import { useUrlParams } from "dhis2-semis-functions"

const WithHeaderBarLayout = ({ baseUrl }: { baseUrl: string }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { remove, useQuery } = useUrlParams()
    const { studentName, loading } = useGetProfile()
    const { loading: loadingAcademicYear, refetch } = useDataStore()

    useEffect(() => {
        refetch()
    }, [])

    const handleBack = () => {
        const originModule = useQuery.get("module")
        remove("tab")
        remove("module")
        navigate(`/semis/${originModule}${location?.search}`);
    }


    if (loading || loadingAcademicYear) {
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
                    type="student"
                    studentName={studentName}
                    onBack={() => handleBack()}
                />
            }
        >
            <Outlet />
        </HeaderBarLayout>
    )
}

export default WithHeaderBarLayout