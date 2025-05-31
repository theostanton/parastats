import {StravaAthleteId} from "@model/Pilot";

export type StravaActivityId = number

export type LatLng = [lat: number, lng: number]
export type Polyline = LatLng[]

export type Flight = {
    pilot_id: StravaAthleteId,
    strava_activity_id: StravaActivityId
    wing: string
    duration_sec: number
    distance_meters: number
    start_date: Date
    description: string
    polyline: Polyline
}