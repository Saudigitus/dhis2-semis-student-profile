import { useEffect, useState } from "react"
import { CustomAttributeProps, DataStoreProps, ProgramConfig, VariablesTypes } from "dhis2-semis-types"
import { formatHeaders } from "../../../../../libs/functions/src/utils/table/header/formatHeaders"
import { formatVariables } from "../../../../../libs/functions/src/utils/table/header/formatVariables"

interface UseHeaderProps {
    programConfigData: ProgramConfig
    dataStoreData: DataStoreProps[0]
}

type Headers = Record<string, CustomAttributeProps[]>

export function useHeader({ programConfigData, dataStoreData }: UseHeaderProps) {
    const [headers, setHeaders] = useState<Headers>({})

    const getHeaders = () => {
        if (!programConfigData?.programStages) {
            return {}
        }

        return programConfigData.programStages.reduce(
            (acc, programStage) => {
                acc[programStage.id] = formatVariables({ variables: programStage?.programStageDataElements || [], type: VariablesTypes.DataElement }) as []
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