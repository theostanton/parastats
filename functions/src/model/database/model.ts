import {StravaActivityId, StravaAthleteId} from "../stravaApi/model";

export type LatLng = [lat: number, lng: number]
export type Polyline = LatLng[]

export type PilotRow = {
    pilot_id: StravaAthleteId
    first_name: string
}

export type PilotRowFull = PilotRow & {
    strava_access_token: string
    strava_refresh_token: string
    strava_expires_at: Date
}

export type DescriptionStatus = "todo" | "failed" | "done";

export type     FlightRow = {
    pilot_id: StravaAthleteId
    strava_activity_id: StravaActivityId
    wing: string
    duration_sec: number
    distance_meters: number
    start_date: Date
    description: string
    polyline: Polyline
    landing_id: string | undefined
    takeoff_id: string | undefined
}

export type Takeoff = {
    slug: string,
    name: string,
    lat: number,
    lng: number,
    alt: number
}

export type Landing = {
    slug: string,
    name: string,
    lat: number,
    lng: number,
    alt: number
}