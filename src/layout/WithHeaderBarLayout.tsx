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
        const originModule = useQuery.get("module");
        const params = new URLSearchParams(location.search);

        params.delete("module");
        params.delete("tab");

        remove("tab");
        remove("module");

        const search = params.toString();

        navigate(`/semis/${originModule}${search ? `?${search}` : ""}`);
    };


    if (loadingAcademicYear) {
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
                    onBack={() => handleBack()}
                    studentName={loading ? <CircularLoader small /> : studentName || ""}
                />
            }
        >
            <Outlet />
        </HeaderBarLayout>
    )
}

export default WithHeaderBarLayout