import {getFlights} from "@database/flights";
import Activity from "@ui/FlightItem";
import styles from "@styles/Page.module.css";
import {Metadata} from "next";
import {createMetadata} from "@ui/metadata";
import FlightItem from "@ui/FlightItem";

export const metadata: Metadata = createMetadata('Flights')

export default async function PageActivities() {
    const [flights, errorMessage] = await getFlights();
    if (flights) {
        return <div className={styles.page}>
            {flights.map(flight =>
                <FlightItem key={flight.strava_activity_id} flight={flight}/>
            )}
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}