type UserRow = {
    user_id: number
    first_name: string
    token: string
}

type ActivityRow = {
    user_id: number
    activity_id: number
    wing: string
    duration_sec: number
    distance_meters: number
}