export type PilotRow = {
    user_id: number
    first_name: string
}

export type PilotRowFull = PilotRow & {
    strava_access_token: string
    strava_refresh_token: string
    strava_expires_at: Date
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
