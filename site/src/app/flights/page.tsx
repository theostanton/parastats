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
        return <div className={styles.page}>
            <div className={styles.container}>
                {/* Header Section */}
                <div className={detailStyles.header}>
                    <div className={detailStyles.headerContent}>
                        <h1 className={detailStyles.title}>✈️ All Flights</h1>
                        <div className={detailStyles.subtitle}>
                            Paragliding flight tracking
                        </div>
                    </div>
                </div>

                {/* Flights Overview Map */}
                <div className={detailStyles.infoCard}>
                    <h3 className={detailStyles.infoTitle}>Flight Paths Overview</h3>
                    <FlightsMap 
                        flights={flights}
                        className={mapStyles.mapContainer}
                    />
                </div>

                {/* Flights List */}
                <div className={detailStyles.infoCard}>
                    <h3 className={detailStyles.infoTitle}>Recent Flights ({flights.length})</h3>
                    <div className={detailStyles.flightsList}>
                        {flights.map(flight =>
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