import { Outlet } from "react-router-dom"
import { HeaderBarLayout, TopHeader } from "dhis2-semis-components"

const WithHeaderBarLayout = ({ baseUrl }: { baseUrl: string }) => {
    return (
        <HeaderBarLayout
            header={
                <TopHeader />
            }
        >
            <Outlet />
        </HeaderBarLayout>
    )
}

export default WithHeaderBarLayout