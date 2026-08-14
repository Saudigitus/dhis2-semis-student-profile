import { format } from "date-fns"

interface EnrollmentDataValue {
    dataElement: string
    value?: string
}

interface EnrollmentEvent {
    event: string
    occurredAt?: string
    scheduledAt?: string
    status?: string
    orgUnit?: string
    programStage: string
    dataValues?: EnrollmentDataValue[]
}

interface Enrollment {
    enrollment?: string
    orgUnit?: string
    events?: EnrollmentEvent[]
}

interface FormattedEvent {
    event: string
    occurredAt?: string
    scheduledAt?: string
    status?: string
    orgUnit?: string
    orgUnitName?: string
    programStage: string
    dataValues: EnrollmentDataValue[]
}

type FormattedEvents = Record<string, FormattedEvent[]>

export const formatEnrollmentEvents = (enrollment?: Enrollment, orgUnits?: any[]): FormattedEvents => {
    if (!enrollment?.events?.length) {
        return {}
    }

    return enrollment.events.reduce(
        (acc, event) => {
            const programStage = event.programStage

            if (!programStage) {
                return acc
            }

            if (!acc[programStage]) {
                acc[programStage] = []
            }

            acc[programStage].push({
                event: event?.event,
                occurredAt: event?.occurredAt ? format(new Date(event?.occurredAt), 'yyyy-MM-dd') : undefined,
                scheduledAt: event?.scheduledAt ? format(new Date(event?.scheduledAt), 'yyyy-MM-dd') : undefined,
                status: event?.status,
                orgUnit: event?.orgUnit || enrollment.orgUnit,
                programStage,
                orgUnitName: orgUnits?.find((orgUnit: any) => orgUnit.id === event.orgUnit)?.displayName || '',
                dataValues: event?.dataValues || [],
                ...(event?.dataValues?.reduce(
                    (acc, dataValue) => ({
                        ...acc,
                        [dataValue.dataElement]: dataValue.value || ''
                    }),
                    {}
                ) || {})
            })

            return acc
        },
        {} as FormattedEvents
    )
}