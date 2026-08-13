import { atom } from "recoil"

//TODO: Change the type to the correct one from dhis2-semis-types

export const ValuesDataStoreState = atom<any[]>({
    key: "values-dataStore-get-state",
    default: undefined,
})
