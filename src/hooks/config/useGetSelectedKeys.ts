import { useGetSectionTypeLabel } from "dhis2-semis-functions";
import { useDataStoreKey, useProgramsKeys } from "dhis2-semis-components";

export default function useGetSelectedKeys() {
    const { sectionName } = useGetSectionTypeLabel();
    const dataStoreData: any = useDataStoreKey({ sectionType: sectionName });
    const programsValues = useProgramsKeys();


    return {
        dataStoreData,
        program: programsValues?.find((program) => program?.id == dataStoreData?.program)
    }
}