'use client'

import {FlightWithSites} from "@parastats/common";
import Link from "next/link";
import Stats from "@ui/stats/Stats";
import {Stat} from "@ui/stats/model";
import ViewOnStrava from "@ui/links/ViewOnStrava";
import styles from "./FlightItem.module.css"
import VerticalSpace from "@ui/VerticalSpace";

export default function FlightItem({flight}: { flight: FlightWithSites }) {
    const topStats: Stat[] = [
        {label: "Takeoff", value: flight.takeoff?.name},
        {label: "Landing", value: flight.landing?.name},
    ]

    const bottomStats: Stat[] = [
        {label: "Duration", value: `${Math.round(flight.duration_sec / 60)}mins`},
        {label: "Distance", value: `${Math.round(flight.distance_meters / 100.0) / 10}km`},
        {label: "Wing", value: flight.wing},
    ]
    return <Link className={styles.container} href={`/flights/${flight.strava_activity_id}`}>
        <Stats stats={topStats}/>
        <VerticalSpace rems={1}/>
        <Stats stats={bottomStats}/>
        <VerticalSpace rems={1}/>
        <ViewOnStrava flightId={flight.strava_activity_id}/>
    </Link>
}