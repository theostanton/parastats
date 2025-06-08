// Core result/either pattern types
export type Result<T> = Success<T> | Failed;

export type Success<T> = {
  success: true;
  data: T;
};

export type Failed = {
  success: false;
  error: string;
};

// Utility type constructors
export const createSuccess = <T>(data: T): Success<T> => ({
  success: true,
  data,
});

export const createFailure = (error: string): Failed => ({
  success: false,
  error,
});

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




