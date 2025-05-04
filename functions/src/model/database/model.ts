export type UserRow = {
    user_id: number
    first_name: string
    token: string
}

export type DescriptionStatus = "todo" | "failed" | "done";

export type ActivityRow = {
    user_id: number
    activity_id: number
    wing: string
    duration_sec: number
    distance_meters: number
    start_date: Date
    description_status: DescriptionStatus
    description: string
}
