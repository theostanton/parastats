import {Flights} from "@database/flights";
import styles from "@styles/Page.module.css";
import detailStyles from "@ui/DetailPages.module.css";
import {Metadata} from "next";
import {createMetadata} from "@ui/metadata";
import FlightItem from "@ui/FlightItem";
import FlightsMap from "@ui/FlightsMap";
import mapStyles from "@ui/FlightMap.module.css";

export const metadata: Metadata = createMetadata('Flights')

export default async function PageActivities() {
    const [flights, errorMessage] = await Flights.getAll();
    if (flights) {
        const latestFlights = flights.toSpliced(20, Infinity)
        return <div className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.title}>All Flights</h1>
                <p className={styles.description}>
                    Paragliding flight tracking with detailed statistics and maps.
                </p>

                {/* Flights Overview Map */}
                <div className={detailStyles.infoCard} style={{marginTop: 'var(--space-8)'}}>
                    <h3 className={detailStyles.infoTitle}>Flight Paths Overview</h3>
                    <FlightsMap
                        flights={flights}
                        className={mapStyles.mapContainer}
                    />
                </div>

                {/* Flights List */}
                <div className={detailStyles.infoCard}>
                    <h3 className={detailStyles.infoTitle}>Recent Flights</h3>
                    <div className={detailStyles.flightsList}>
                        {latestFlights.map(flight =>
                            <FlightItem key={flight.strava_activity_id} flight={flight}/>
                        )}
                    </div>
                </div>
            </div>
        </div>
    } else {
        return <div className={styles.page}>
            <div className={styles.container}>
                <h1>{errorMessage}</h1>
            </div>
        </div>
    }
}