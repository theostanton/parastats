import {Either, failed, FlightRow, success} from '@parastats/common';
import { Sites } from '@/database/Sites';
import { StravaActivity } from '@/stravaApi/model';
import { decode, LatLngTuple } from '@googlemaps/polyline-codec';

/**
 * Convert Strava activity to flight record using Result pattern
 */
export async function convertStravaActivityToFlight(pilotId: number, stravaActivity: StravaActivity): Promise<Either<FlightRow>> {
    try {
        // Extract wing from description
        const matches = stravaActivity.description
            .split("\n")
            .map((line) => line.match(/^🪂 ([a-zA-Z ]*)/g))
            .filter(match => match != null && match.length > 0)
            .map((line) => line!![0].replace("🪂 ", ""));

        if (matches.length === 0) {
            return failed(`Couldn't extract wing from description=${stravaActivity.description}`);
        }

        const wing = matches[0];

        // Decode polyline
        const tuples: LatLngTuple[] = decode(stravaActivity.map.polyline);
        
        if (tuples.length < 2) {
            return failed(`Not enough points on polyline=${JSON.stringify(stravaActivity.map.polyline)} tuples=${JSON.stringify(tuples)}`);
        }

        const polyline = tuples.map(tuple => [tuple[0], tuple[1]] as [number, number]);

        // Get site IDs for takeoff and landing
        const takeoffPoint = polyline[0];
        const landingPoint = polyline[polyline.length - 1];
        
        const takeoffId = await Sites.getIdOfCloset(takeoffPoint);
        const landingId = await Sites.getIdOfCloset(landingPoint);

        const flightRow: FlightRow = {
            pilot_id: pilotId,
            strava_activity_id: stravaActivity.id.toString(),
            distance_meters: stravaActivity.distance,
            duration_sec: stravaActivity.elapsed_time,
            wing: wing,
            start_date: new Date(stravaActivity.start_date),
            description: stravaActivity.description,
            polyline: polyline,
            takeoff_id: takeoffId || undefined,
            landing_id: landingId || undefined
        };

        return success(flightRow);
    } catch (error) {
        return failed(`Failed to convert activity: ${error instanceof Error ? error.message : String(error)}`);
    }
}