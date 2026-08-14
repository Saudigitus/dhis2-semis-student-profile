import { useGetSectionTypeLabel } from "dhis2-semis-functions";
import { useDataStoreKey, useProgramsKeys } from "dhis2-semis-components";
import type { DataStoreProps } from "dhis2-semis-types"

export default function useGetSelectedKeys() {
    const { sectionName } = useGetSectionTypeLabel();
    const dataStoreData: DataStoreProps = useDataStoreKey({ sectionType: sectionName });
    const programsValues = useProgramsKeys();


    return {
        dataStoreData,
        program: programsValues?.find((program) => program?.id == dataStoreData?.program)
    }
}