import {StravaActivity, StravaAthleteId} from "../../model/stravaApi/model";
import {FlightRow, LatLng, Polyline} from "../../model/database/model";
import {decode, LatLngTuple} from "@googlemaps/polyline-codec";
import {Takeoffs} from "../../model/database/Takeoffs";
import {Landings} from "../../model/database/Landings";
import {Result} from "../../model/model";

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

type FlightRowInitial = Optional<FlightRow, 'polyline'>
type FlightRowGeoData = Pick<FlightRow, 'polyline'>
type FlightRowLandingTakeOffIds = Pick<FlightRow, 'takeoff_id' | 'landing_id'>

export class StravaActivityToFlightConverter {
    static async convert(pilotId: StravaAthleteId, stravaActivity: StravaActivity): Promise<Result<FlightRow>> {

        const matches = stravaActivity.description
            .split("\n")
            .map((line) => line.match(/^🪂 ([a-zA-Z ]*)/g))
            .filter(match => match != null && match.length > 0)
            .map((line) => line!![0].replace("🪂 ", ""))

        if (matches.length == 0) {
            return {
                success: false,
                error: `Couldn't extract wing from description=${stravaActivity.description}`
            }
        }

        const wing = matches[0]

        const initial: FlightRowInitial = {
            pilot_id: parseInt(pilotId.toString()),
            strava_activity_id: stravaActivity.id.toString(),
            distance_meters: stravaActivity.distance,
            duration_sec: stravaActivity.elapsed_time,
            wing: wing,
            start_date: new Date(stravaActivity.start_date),
            description: stravaActivity.description,
            landing_id: undefined,
            takeoff_id: undefined
        }

        const geoResult = extractGeoData(stravaActivity)

        if (geoResult.success == false) {
            return geoResult
        }

        const takeoffLandingIds = await associateTakeoffLandingIds(geoResult.value.polyline)

        const value: FlightRow = {
            ...initial,
            ...geoResult.value,
            ...takeoffLandingIds
        }

        return {
            success: true,
            value
        }

    }

}

export async function associateTakeoffLandingIds(polyline: Polyline): Promise<FlightRowLandingTakeOffIds> {

    const takeoffPoint = polyline[0]
    const landingPoint = polyline[polyline.length - 1]

    const takeoff_slug: string | null = await Takeoffs.getSlugOfClosest(takeoffPoint)
    const landing_slug: string | null = await Landings.getSlugOfClosest(landingPoint)

    return {
        takeoff_id: takeoff_slug ? takeoff_slug : undefined,
        landing_id: landing_slug ? landing_slug : undefined,
    }


}

export function extractGeoData(stravaActivity: StravaActivity): Result<FlightRowGeoData> {
    const tuples: LatLngTuple[] = decode(stravaActivity.map.polyline)

    if (tuples.length < 2) {
        return {
            success: false,
            error: `Not enough points on polyline=${JSON.stringify(stravaActivity.map.polyline)} tuples=${JSON.stringify(tuples)}`
        }
    }

    const polyline: LatLng[] = tuples.map(tuple => {
        const latLng: LatLng = [tuple[0], tuple[1]]
        return latLng
    })

    return {
        success: true,
        value: {polyline}
    }
}