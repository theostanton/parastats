import {getPilot} from "@database/pilots";
import {getFlightsForPilot, getFlightsForPilotAndWing} from "@database/flights";
import Activity from "@ui/FlightItem";
import styles from "@styles/Page.module.css";
import FlightItem from "@ui/FlightItem";

export default async function PagePilot({params}: {
    params: Promise<{ pilot_id: number, wing: string }>
}) {
    const {pilot_id, wing} = await params
    console.log('pilot_id', pilot_id, 'wing', wing)
    const [pilot, pilotErrorMessage] = await getPilot(pilot_id);
    if (pilotErrorMessage) {
        return <h1>pilotErrorMessage={pilotErrorMessage}</h1>
    }

    const [flights, flightsErrorMessage] = await getFlightsForPilotAndWing(pilot_id, wing);
    if (flightsErrorMessage) {
        return <h1>flightsErrorMessage={flightsErrorMessage}</h1>
    }

    return <div className={styles.page}>
        <h1>{pilot.first_name} • {wing}</h1>
        <h3>{flights.length} activities</h3>
        {flights.map(flight => <FlightItem key={flight.strava_activity_id} flight={flight}/>)}
    </div>
}