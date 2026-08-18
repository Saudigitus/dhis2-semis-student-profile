import { useState } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'

export const useOrgUnitName = () => {
    const engine = useDataEngine()
    const [loading, setLoading] = useState(false)
    const [orgUnitNames, setOrgUnitNames] = useState<any[]>([])

    const getOrgUnitNames = async (orgUnitIds: string[] = []) => {
        if (!orgUnitIds.length) {
            setOrgUnitNames([])
            return []
        }

        setLoading(true)

        try {
            const { organisationUnits }: any =
                await engine.query({
                    organisationUnits: {
                        resource: 'organisationUnits',
                        params: {
                            filter: `id:in:[${orgUnitIds.join(',')}]`,
                            fields: 'id,displayName',
                            pageSize: orgUnitIds.length
                        }
                    }
                })

                
            const result = organisationUnits?.organisationUnits || []
            setOrgUnitNames(result)
            return result
        } finally {
            setLoading(false)
        }
    }

    return { orgUnitNames, getOrgUnitNames, loading }
}