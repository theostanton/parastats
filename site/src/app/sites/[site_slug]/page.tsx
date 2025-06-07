import styles from "@styles/Page.module.css";
import detailStyles from "@ui/DetailPages.module.css";
import {Metadata} from "next";
import {createMetadata} from "@ui/metadata";
import {Sites} from "@database/Sites";
import {Flights} from "@database/flights";
import FlightItem from "@ui/FlightItem";
import {StravaAthleteId} from "@parastats/common";

export const metadata: Metadata = createMetadata("Site")

export default async function SiteDetail({params}: {
    params: Promise<{ site_slug: string }>
}) {
    const slug = (await params).site_slug;
    const [site, errorMessage] = await Sites.getForSlug(slug);
    
    if (!site) {
        return <div className={styles.page}>
            <div className={styles.container}>
                <h1>{errorMessage}</h1>
            </div>
        </div>;
    }

    // Get recent flights from this site (both takeoffs and landings)
    const [allFlights] = await Flights.getAll();
    const siteFlights = allFlights ? allFlights.filter(flight => 
        flight.takeoff?.ffvl_sid === site.ffvl_sid || 
        flight.landing?.ffvl_sid === site.ffvl_sid
    ).slice(0, 10) : [];

    const formatCoordinate = (coord: number) => coord.toFixed(6);
    const formatAltitude = (alt: number) => `${alt}m`;

    return <div className={styles.page}>
        <div className={styles.container}>
            {/* Header Section */}
            <div className={detailStyles.header}>
                <div className={detailStyles.headerContent}>
                    <h1 className={detailStyles.title}>🏔️ {site.name}</h1>
                    <div className={detailStyles.subtitle}>
                        Flying Site
                    </div>
                </div>
            </div>

            {/* Site Information Grid */}
            <div className={detailStyles.grid}>
                {/* Location Details Card */}
                <div className={detailStyles.infoCard}>
                    <h3 className={detailStyles.infoTitle}>Location Details</h3>
                    <div className={detailStyles.infoGrid}>
                        <div className={detailStyles.infoItem}>
                            <span className={detailStyles.infoLabel}>Latitude</span>
                            <span className={detailStyles.coordinates}>{formatCoordinate(site.lat)}</span>
                        </div>
                        <div className={detailStyles.infoItem}>
                            <span className={detailStyles.infoLabel}>Longitude</span>
                            <span className={detailStyles.coordinates}>{formatCoordinate(site.lng)}</span>
                        </div>
                        <div className={detailStyles.infoItem}>
                            <span className={detailStyles.infoLabel}>Altitude</span>
                            <span className={detailStyles.infoValue}>{formatAltitude(site.alt)}</span>
                        </div>
                        <div className={detailStyles.infoItem}>
                            <span className={detailStyles.infoLabel}>Site ID</span>
                            <span className={detailStyles.coordinates}>{site.ffvl_sid}</span>
                        </div>
                    </div>
                </div>

                {/* Flight Statistics Card */}
                <div className={detailStyles.infoCard}>
                    <h3 className={detailStyles.infoTitle}>Flight Activity</h3>
                    <div className={detailStyles.infoGrid}>
                        <div className={detailStyles.infoItem}>
                            <span className={detailStyles.infoLabel}>Recent Flights</span>
                            <span className={detailStyles.infoValue}>{siteFlights.length}</span>
                        </div>
                        <div className={detailStyles.infoItem}>
                            <span className={detailStyles.infoLabel}>Site Slug</span>
                            <span className={detailStyles.coordinates}>{site.slug}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Flights Section */}
            {siteFlights.length > 0 && (
                <div className={detailStyles.infoCard}>
                    <h3 className={detailStyles.infoTitle}>Recent Flights</h3>
                    <div className={detailStyles.flightsList}>
                        {siteFlights.map(flight => (
                            <FlightItem key={flight.strava_activity_id} flight={flight} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>;
}