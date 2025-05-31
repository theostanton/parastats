'use client'

import {Flight} from "@model/Flight";

export default function FlightItem({flight}: { flight: Flight }) {
    return <a href={`/flights/${flight.strava_activity_id}`}>
        <h1>{flight.strava_activity_id} {flight.wing} {flight.distance_meters}m {flight.duration_sec}secs</h1>
    </a>
}