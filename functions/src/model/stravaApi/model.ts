export type StravaActivityId = string
export type StravaAthleteId = number

export type StravaAthlete = {
    id: StravaAthleteId
    username: string
    firstname: string
    lastname: string
}

type StravaActivityType = "AlpineSki" | "KiteSurf" | "Workout" | string

export type StravaActivitySummary = {
    id: StravaActivityId
    name: string
    distance: number
    type: StravaActivityType
    description: string
    moving_time: number
    elapsed_time: number
    start_date: Date
    map: {
        polyline: string
    }
}

export type StravaActivity = StravaActivitySummary & {
    description: string
}