import { D2I18n, ProgramConfig } from "dhis2-semis-types"

// The profile is built from the program metadata and the SEMIS modules (SEMIS-248): nothing is configured for it,
// and the tabs are the same as on the mobile app.

export type ProfileComponentType = "TEI_FORM" | "EVENT_TABLE" | "EVENT_CARDS"

export interface ProfileComponent {
    type: ProfileComponentType
    displayName: string
    order: number
    programStage?: string
    // Only these attributes, when the program groups them in sections.
    attributes?: string[]
}

export interface ProfileTab {
    id: string
    displayName: string
    components: ProfileComponent[]
}

const isEnabled = (dataStoreData: any, key: string) =>
    !!dataStoreData?.[key] && dataStoreData[key]?.enabled !== false

const findStage = (program: ProgramConfig | undefined, programStage?: string): any =>
    programStage ? program?.programStages?.find(stage => stage.id === programStage) : undefined

// One card per stage, named after the stage: the records of a stage are shown once, whatever sections the stage has.
const stageComponents = (program: ProgramConfig | undefined, programStage: string | undefined, type: ProfileComponentType): ProfileComponent[] => {
    const stage = findStage(program, programStage)
    return stage ? [{ type, displayName: stage.displayName, order: 0, programStage: stage.id }] : []
}

const attributeComponents = (program: ProgramConfig | undefined): ProfileComponent[] => {
    const sections = [...((program as any)?.programSections ?? [])].sort((a: any, b: any) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0))
    if (!sections.length) return [{ type: "TEI_FORM", displayName: program?.displayName ?? "", order: 0 }]

    return sections.map((section: any, index: number) => ({
        type: "TEI_FORM",
        displayName: section.displayName,
        order: index,
        attributes: (section.trackedEntityAttributes ?? []).map((attribute: any) => attribute.id),
    }))
}

export function buildProfileTabs(dataStoreData: any, program: ProgramConfig | undefined, i18n: D2I18n): ProfileTab[] {
    if (!dataStoreData || !program) return []

    const tabs: ProfileTab[] = [{
        id: "details",
        displayName: i18n.t("Personal details"),
        components: [
            ...attributeComponents(program),
            ...stageComponents(program, dataStoreData?.registration?.programStage, "EVENT_CARDS"),
            ...stageComponents(program, dataStoreData?.["socio-economics"]?.programStage, "EVENT_CARDS"),
        ],
    }]

    if (isEnabled(dataStoreData, "attendance")) {
        tabs.push({ id: "attendance", displayName: i18n.t("Attendance"), components: stageComponents(program, dataStoreData.attendance.programStage, "EVENT_TABLE") })
    }

    if (isEnabled(dataStoreData, "performance")) {
        const stages = (dataStoreData.performance.programStages ?? []).map((item: any) => item?.programStage)
        tabs.push({ id: "performance", displayName: i18n.t("Performance"), components: stages.flatMap((stage: string) => stageComponents(program, stage, "EVENT_CARDS")) })
    }

    if (isEnabled(dataStoreData, "final-result")) {
        tabs.push({ id: "final-result", displayName: i18n.t("Final result"), components: stageComponents(program, dataStoreData["final-result"].programStage, "EVENT_CARDS") })
    }

    if (isEnabled(dataStoreData, "transfer")) {
        tabs.push({ id: "transfer", displayName: i18n.t("Transfer"), components: stageComponents(program, dataStoreData.transfer.programStage, "EVENT_TABLE") })
    }

    // A module whose stage is not in the program has nothing to show.
    return tabs.filter(tab => tab.components.length)
}

export function isFinalResultEnabled(dataStoreData: any, program: ProgramConfig | undefined): boolean {
    return isEnabled(dataStoreData, "final-result") && !!findStage(program, dataStoreData?.["final-result"]?.programStage)
}
