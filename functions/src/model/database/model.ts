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

export enum SiteType {
    landing,
    takeoff
}

export type Site = {
    ffvl_sid: string,
    slug: string,
    name: string,
    lat: number,
    lng: number,
    alt: number,
    polygon: Polyline | null
    type: SiteType | null
    nearest_balise_id: string | null
}

export type Windsock = {
    balise_id: string,
    name: string,
    lat: number,
    lng: number,
    alt: number,
}