import {getPilot} from "@database/pilots";
import {getFlightsForPilot} from "@database/flights";
import Activity from "@ui/FlightItem";
import {getPilotWingStats} from "@database/stats";
import styles from "@styles/Page.module.css";
import {Metadata, ResolvingMetadata} from "next";
import {createMetadata} from "@ui/metadata";
import {StravaAthleteId} from "@model/Pilot";
import FlightItem from "@ui/FlightItem";

type Params = { pilot_id: StravaAthleteId };

export async function generateMetadata(
    {params}: { params: Promise<Params> },
    parent: ResolvingMetadata
): Promise<Metadata> {

    const pilotId = (await params).pilot_id
    const [pilot, pilotErrorMessage] = await getPilot(pilotId);
    if (pilotErrorMessage) {
        return createMetadata()
    }
    return createMetadata(pilot.first_name)
}


export default async function PagePilot({params}: {
    params: Promise<Params>
}) {
    const pilotId = (await params).pilot_id
    const [pilot, pilotErrorMessage] = await getPilot(pilotId);
    if (pilotErrorMessage) {
        return <h1>pilotErrorMessage={pilotErrorMessage}</h1>
    }

    const [wingStats, wingStatsErrorMessage] = await getPilotWingStats(pilotId);
    if (wingStatsErrorMessage) {
        return <h1>wingStatsErrorMessage={wingStatsErrorMessage}</h1>
    }

    const [flights, flightsErrorMessage] = await getFlightsForPilot(pilotId, 5);
    if (flightsErrorMessage) {
        return <h1>flightsErrorMessage={flightsErrorMessage}</h1>
    }

    return <div className={styles.page}>
        <h1>{pilot.first_name}</h1>
        <h3>Wings</h3>
        {wingStats.wingStats.map(item => (
            <a key={item.wing} href={`/pilots/${pilotId}/${item.wing.toLowerCase()}`}>
                <div>{item.wing} • {item.flights} flights</div>
            </a>
        ))}

        <h3>Recent flights</h3>
        {flights.map(flight => <FlightItem key={flight.strava_activity_id} flight={flight}/>)}
    </div>
}