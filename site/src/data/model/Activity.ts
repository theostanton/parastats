export enum DescriptionStatus {
    todo,
    done,
    failed
}

export type Activity = {
    user_id: number,
    activity_id: number
    wing: string
    duration_sec: number
    distance_meters: number
    start_date: Date
    description_status: DescriptionStatus
    description: string
}