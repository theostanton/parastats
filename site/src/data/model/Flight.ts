import {StravaAthleteId} from "@model/Pilot";
import {Site} from "@model/Site";

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
    takeoff_id: string
    landing_id: string
}

export type FlightWithSites = Exclude<Flight, 'takeoff_id' | 'landing_id'> & {
    takeoff: Site | null
    landing: Site | null
}