// Base ID types
export type StravaAthleteId = number;
export type StravaActivityId = string;
export type PilotId = number;
export type FlightId = number;
export type SiteId = number;


// Core entity types
export type Pilot = {
  first_name: string,
  pilot_id: StravaAthleteId,
  profile_image_url: string | null
}

export enum SiteType {
  Landing,
  TakeOff,
}

export interface Site {
  ffvl_sid: string;
  slug: string;
  name: string;
  lat: number;
  lng: number;
  alt: number;
  polygon: Polyline | undefined;
  nearest_balise_id: string | undefined;
}

export interface Flight {
  pilot_id: StravaAthleteId;
  strava_activity_id: StravaActivityId;
  wing: string;
  duration_sec: number;
  distance_meters: number;
  start_date: Date;
  description: string;
  polyline: Polyline;
  takeoff_id: string;
  landing_id: string;
}

export interface FlightWithSites extends Exclude<Flight, 'takeoff_id' | 'landing_id'> {
  takeoff: Site | null;
  landing: Site | null;
  pilot: Pilot | null;
}

// Geometric types
export type LatLng = [lat: number, lng: number]
export type Polyline = LatLng[]

// Database row types
export type FlightRow = {
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

export type DescriptionPreference = {
    pilot_id: StravaAthleteId
    include_sites: boolean
    include_wind: boolean
    include_wing_aggregate: boolean
    include_year_aggregate: boolean
    include_all_time_aggregate: boolean
}

export type AggregationResult = {
    count: number
    total_duration_sec: number
    total_distance_meters: number
}

// Wind direction enum (for FFVL integration)
export enum WindDirection {
    N,
    NE, 
    E,
    SE,
    S,
    SW,
    W,
    NW
}

// FFVL wind report type
export type WindReport = {
    windKmh: number
    gustKmh: number
    direction: WindDirection
}
