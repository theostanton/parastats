import {get} from "@database/pilots";
import {Flights} from "@database/flights";
import styles from "@styles/Page.module.css";
import FlightItem from "@ui/FlightItem";

export default async function PagePilot({params}: {
    params: Promise<{ pilot_id: string, wing: string }>
}) {
    const {pilot_id: pilotIdStr, wing} = await params
    const pilot_id = parseInt(pilotIdStr)
    console.log('pilot_id', pilot_id, 'wing', wing)
    const [pilot, pilotErrorMessage] = await get(pilot_id);
    if (pilotErrorMessage) {
        return <h1>pilotErrorMessage={pilotErrorMessage}</h1>
    }

    const [flights, flightsErrorMessage] = await Flights.getForPilotAndWing(pilot_id, wing);
    if (flightsErrorMessage) {
        return <h1>flightsErrorMessage={flightsErrorMessage}</h1>
    }

    return <div className={styles.page}>
        <h1>{pilot.first_name} • {wing}</h1>
        <h3>{flights.length} flights</h3>
        {flights.map(flight => <FlightItem key={flight.strava_activity_id} flight={flight}/>)}
    </div>
}