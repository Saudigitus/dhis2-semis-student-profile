import { useEffect, useState } from "react"
import { formatVariables } from "dhis2-semis-functions"
import { CustomAttributeProps, DataStoreProps, ProgramConfig, VariablesTypes } from "dhis2-semis-types"

interface UseHeaderProps {
    programConfigData: ProgramConfig
    dataStoreData: DataStoreProps[0]
}

type Headers = Record<string, CustomAttributeProps[]>

export function useHeaders({ programConfigData, dataStoreData }: UseHeaderProps) {
    const [headers, setHeaders] = useState<Headers>({})

    const getHeaders = () => {
        if (!programConfigData?.programStages) {
            return {}
        }

        return programConfigData?.programStages?.reduce(
            (acc, programStage) => {
                acc[programStage.id] = formatVariables({
                    type: VariablesTypes.DataElement,
                    variables: programStage?.programStageDataElements || [] as unknown as any[],
                }
                ) as []
                return acc
            },
            {} as Headers
        )
    }

    useEffect(() => {
        setHeaders(getHeaders())
    }, [programConfigData, dataStoreData])

    return { headers, getHeaders }
}