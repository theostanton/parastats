import * as stream from "node:stream";

export type StravaAthlete = {
    id: number
    username: string
    firstname: string
    lastname: string
}

type StravaActivityType = "AlpineSki" | "KiteSurf" | "Workout" | string

export type StravaActivitySummary = {
    id: number
    name: string
    distance: number
    type: StravaActivityType
    description: string
    moving_time: number
    elapsed_time: number
    start_date: Date
}

export type StravaActivity = StravaActivitySummary & {
    description: string
}