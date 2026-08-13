import { atom } from "recoil"

export const GeneralLoadingState = atom<boolean>({
    key: "general-loading-get-state",
    default: false,
})