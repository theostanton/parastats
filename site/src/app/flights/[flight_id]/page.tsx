import {getFlight} from "@database/flights";
import Activity from "@ui/FlightItem";
import styles from "@styles/Page.module.css";
import FlightItem from "@ui/FlightItem";

export default async function PagePilot({params}: {
    params: Promise<{ flight_id: number }>
}) {
    const {flight_id} = await params
    const [flight, errorMessage] = await getFlight(flight_id);
    if (flight) {
        return <div className={styles.page}>
            <FlightItem flight={flight}/>
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}