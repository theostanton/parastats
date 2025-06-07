import {Flights} from "@database/flights";
import styles from "@styles/Page.module.css";
import {Stat} from "@ui/stats/model";
import {StravaActivityId} from "@parastats/common";
import Stats from "@ui/stats/Stats";
import TakeoffLink from "@ui/links/TakeoffLink";
import LandingLink from "@ui/links/LandingLink";
import WingLink from "@ui/links/WingLink";
import ViewOnStrava from "@ui/links/ViewOnStrava";
import {Metadata} from "next";
import {createMetadata} from "@ui/metadata";

export const metadata: Metadata = createMetadata("Flight")

export default async function FlightDetail({params}: {
    params: Promise<{ flight_id: StravaActivityId }>
}) {
    const flightId = (await params).flight_id
    const [flight, errorMessage] = await Flights.get(flightId);
    if (flight) {

        const stats: Stat[] = [
            {label: "Duration", value: `${Math.round(flight.duration_sec / 60)}mins`},
            {label: "Distance", value: `${Math.round(flight.distance_meters / 100.0) / 10}km`},
        ]

        return <div className={styles.page}>
            <h1>Flight {flight.strava_activity_id}</h1>
            
            <div className={styles.section}>
                <Stats stats={stats}/>
            </div>

            <div className={styles.section}>
                <h2>Flight Details</h2>
                <TakeoffLink takeoff={flight.takeoff}/>
                <LandingLink landing={flight.landing}/>
                <WingLink wing={flight.wing} pilotId={flight.pilot_id}/>
            </div>

            <div className={styles.section}>
                <ViewOnStrava flightId={flight.strava_activity_id}/>
            </div>

            <div className={styles.descriptionBox}>
                <div className={styles.descriptionLabel}>Description</div>
                <span className={styles.span}>{flight.description}</span>
                <div className={styles.actionButton}>Update</div>
            </div>
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}