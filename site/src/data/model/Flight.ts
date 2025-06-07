import {StravaAthleteId} from "@model/Pilot";
import {Site} from "@model/Site";
import {Polyline} from "@parastats/common";

export type StravaActivityId = number

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