import {getPilot} from "@database/pilots";
import {getFlightsForPilot} from "@database/flights";
import Activity from "@ui/FlightItem";
import styles from "@styles/Page.module.css";
import FlightItem from "@ui/FlightItem";

export default async function PagePilot({params}: {
    params: Promise<{ pilot_id: number }>
}) {
    const {pilot_id} = await params
    const [pilot, pilotErrorMessage] = await getPilot(pilot_id);
    if (pilotErrorMessage) {
        return <h1>pilotErrorMessage={pilotErrorMessage}</h1>
    }

    const [flights, flightsErrorMessage] = await getFlightsForPilot(pilot_id);
    if (flightsErrorMessage) {
        return <h1>flightsErrorMessage={flightsErrorMessage}</h1>
    }

    return <div className={styles.page}>
        <h1>{pilot.first_name}</h1>
        {flights.map(flight => <FlightItem key={flight.strava_activity_id} flight={flight}/>)}
    </div>
}