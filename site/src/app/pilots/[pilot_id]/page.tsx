import {get} from "@database/pilots";
import {Flights} from "@database/flights";
import {getPilotWingStats} from "@database/stats";
import styles from "@styles/Page.module.css";
import {Metadata, ResolvingMetadata} from "next";
import {createMetadata} from "@ui/metadata";
import {StravaAthleteId} from "@parastats/common";
import FlightItem from "@ui/FlightItem";
import Link from "next/link";
import {Sites} from "@database/Sites";

type Params = { pilot_id: StravaAthleteId };

export async function generateMetadata(
    {params}: { params: Promise<Params> },
    parent: ResolvingMetadata
): Promise<Metadata> {

    const pilotId = (await params).pilot_id
    const [pilot, pilotErrorMessage] = await get(pilotId);
    if (pilotErrorMessage) {
        return createMetadata()
    }
    return createMetadata(pilot.first_name)
}


export default async function PagePilot({params}: {
    params: Promise<Params>
}) {
    const pilotId = (await params).pilot_id
    const [pilot, pilotErrorMessage] = await get(pilotId);
    if (pilotErrorMessage) {
        return <h1>pilotErrorMessage={pilotErrorMessage}</h1>
    }

    const [wingStats, wingStatsErrorMessage] = await getPilotWingStats(pilotId);
    if (wingStatsErrorMessage) {
        return <h1>wingStatsErrorMessage={wingStatsErrorMessage}</h1>
    }

    const [stats, takeoffStatsErrorMessage] = await Sites.getPilotStats(pilotId);
    if (takeoffStatsErrorMessage) {
        return <h1>takeoffStatsErrorMessage={takeoffStatsErrorMessage}</h1>
    }

    const [flights, flightsErrorMessage] = await Flights.getForPilot(pilotId, 5);
    if (flightsErrorMessage) {
        return <h1>flightsErrorMessage={flightsErrorMessage}</h1>
    }

    return <div className={styles.page}>
        <h1>{pilot.first_name}</h1>
        <h3>🪂 Wings</h3>
        {wingStats.wingStats.map(item => (
            <a key={item.wing} href={`/pilots/${pilotId}/${item.wing.toLowerCase()}`}>
                <div>{item.wing} • {item.flights} flights</div>
            </a>
        ))}

        <h3>↗️ Takeoffs</h3>
        {stats.takeoffs
            .filter(item => item.site)
            .map(item => (
                <Link key={item.site.slug} href={`/takeoffs/${item.site.slug}`}>
                    <div>{item.site.name} • {item.flights} flights</div>
                </Link>
            ))}

        <h3>️↘️ Landings</h3>
        {stats.landings
            .filter(item => item.site)
            .map(item => (
                <Link key={item.site.slug} href={`/landings/${item.site.slug}`}>
                    <div>{item.site.name} • {item.flights} flights</div>
                </Link>
            ))}

        <h3>Recent flights</h3>
        {flights.map(flight => <FlightItem key={flight.strava_activity_id} flight={flight}/>)}
    </div>
}