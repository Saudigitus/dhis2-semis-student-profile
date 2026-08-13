import { useRecoilState, useSetRecoilState } from 'recoil';
import { useDataEngine } from "@dhis2/app-runtime"
import useShowAlerts from '../commons/useShowAlert';
import { SchoolCalendarData } from "dhis2-semis-components";
import { ValuesDataStoreState } from "../../schema/valuesDataStoreSchema";
import { useState } from 'react';
import { GeneralLoadingState } from '../../schema/loadingSchema';

const DATASTORE_QUERY = ({
    config: {
        resource: "dataStore/semis/schoolCalendar",
        params: {
            fields: "*"
        }
    }
})

export function useDataStore() {
    const engine = useDataEngine()
    const { hide, show } = useShowAlerts()
    const [error, setError] = useState(false)
    const setDataStoreState = useSetRecoilState(SchoolCalendarData);
    const [loading, setLoading] = useRecoilState(GeneralLoadingState)
    const setValuesDataStoreState = useSetRecoilState(ValuesDataStoreState)

    const getDataStore = async () => {
        setLoading(true)
        await engine.query(DATASTORE_QUERY, {
            onError(error) {
                show({
                    message: `${("Could not get data")}: ${error.message}`,
                    type: { critical: true }
                });
                setError(true)
                setLoading(false)
                setTimeout(hide, 5000);
            },
            onComplete(data) {
                setLoading(false)
                setDataStoreState(data?.config)
                setValuesDataStoreState(data?.config?.academicYear)
            }
        })
    }

    const refetch = () => getDataStore()

    return { loading, error, refetch }
}