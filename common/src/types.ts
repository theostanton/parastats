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
export type StravaAthleteId = string;
export type StravaActivityId = string;
export type PilotId = number;
export type FlightId = number;
export type SiteId = number;

export type PolylineString = string;

// Core entity types
export interface Pilot {
  id: PilotId;
  strava_athlete_id: StravaAthleteId;
  first_name: string;
  last_name: string;
  username: string;
  city: string;
  country: string;
  profile: string;
  profile_medium: string;
  created_at: Date;
  updated_at: Date;
}

export enum SiteType {
  TakeOff = 'takeoff',
  Landing = 'landing',
}

export interface Site {
  id: SiteId;
  name: string;
  latitude: number;
  longitude: number;
  type: SiteType;
  altitude: number;
  slug: string;
  ffvl_id?: number;
}

export interface Flight {
  id: FlightId;
  pilot_id: PilotId;
  strava_activity_id: StravaActivityId;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: Date;
  average_speed: number;
  max_speed: number;
  start_latlng: LatLng;
  end_latlng: LatLng;
  map_polyline: Polyline;
  takeoff_site_id?: SiteId;
  landing_site_id?: SiteId;
  wing?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FlightWithSites extends Flight {
  takeoff_site?: Site;
  landing_site?: Site;
}

// Strava API types
export interface StravaAthlete {
  id: StravaAthleteId;
  username: string;
  firstname: string;
  lastname: string;
  city: string;
  country: string;
  profile: string;
  profile_medium: string;
}


export type LatLng = [lat: number, lng: number]
export type Polyline = LatLng[]

export interface StravaActivitySummary {
  id: StravaActivityId;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  start_date_local: string;
  average_speed: number;
  max_speed: number;
  start_latlng: [number, number];
  end_latlng: [number, number];
  map: {
    polyline: PolylineString;
  };
}

export interface StravaActivity extends StravaActivitySummary {
  description?: string;
}

// FFVL API types
export enum WindDirection {
  N = 'N',
  NE = 'NE', 
  E = 'E',
  SE = 'SE',
  S = 'S',
  SW = 'SW',
  W = 'W',
  NW = 'NW',
}

export interface FfvlBalise {
  id: number;
  nom: string;
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface FfvlSite {
  id: number;
  nom: string;
  latitude: number;
  longitude: number;
  orientation: string;
  altitude: number;
  balises: FfvlBalise[];
}

export interface WindsockReport {
  direction: WindDirection;
  strength: number;
  timestamp: Date;
}

export interface FfvlReport {
  id: number;
  site_id: number;
  wind_direction: WindDirection;
  wind_strength: number;
  timestamp: Date;
}

export interface Windsock {
  id: number;
  site_id: SiteId;
  ffvl_balise_id: number;
  created_at: Date;
  updated_at: Date;
}

// Description preferences
export interface DescriptionPreference {
  id: number;
  pilot_id: PilotId;
  include_takeoff: boolean;
  include_landing: boolean;
  include_wing: boolean;
  include_distance: boolean;
  include_duration: boolean;
  include_max_altitude: boolean;
  include_wind: boolean;
  created_at: Date;
  updated_at: Date;
}

// Task system types
export type TaskResult<T = any> = TaskSuccess<T> | TaskFailure;

export type TaskSuccess<T = any> = {
  success: true;
  data: T;
};

export type TaskFailure = {
  success: false;
  error: string;
};

export interface TaskBody {
  type: string;
  [key: string]: any;
}

export interface UpdateDescriptionTask extends TaskBody {
  type: 'updateDescription';
  pilot_id: PilotId;
  strava_activity_id: StravaActivityId;
}

export interface FetchAllActivitiesTask extends TaskBody {
  type: 'fetchAllActivities';
  pilot_id: PilotId;
}

export interface SyncSitesTask extends TaskBody {
  type: 'syncSites';
}

export interface HelloWorldTask extends TaskBody {
  type: 'helloWorld';
  message: string;
}

// Statistics types
export type Stat = {
  label: string;
  value: string;
};

export interface WingStatItem {
  wing: string;
  count: number;
  total_distance: number;
  total_duration: number;
}

export interface PilotWingStats {
  pilot_id: PilotId;
  stats: WingStatItem[];
}

export interface SitesStatsItem {
  site: Site;
  count: number;
}

export interface PilotSitesStats {
  pilot_id: PilotId;
  takeoff_stats: SitesStatsItem[];
  landing_stats: SitesStatsItem[];
}

// API Response types
export interface BaseResponse {
  success: boolean;
  message?: string;
}

export interface GetSelfResponse extends BaseResponse {
  pilot?: Pilot;
}