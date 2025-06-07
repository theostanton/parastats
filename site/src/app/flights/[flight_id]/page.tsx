import {Flights} from "@database/flights";
import styles from "@styles/Page.module.css";
import flightStyles from "./FlightDetail.module.css";
import {Stat} from "@ui/stats/model";
import {StravaActivityId} from "@parastats/common";
import Stats from "@ui/stats/Stats";
import ViewOnStrava from "@ui/links/ViewOnStrava";
import ClientOnlyDate from "@ui/ClientOnlyDate";
import Link from "next/link";


export default async function FlightDetail({params}: {
    params: Promise<{ flight_id: StravaActivityId }>
}) {
    const flightId = (await params).flight_id;
    const [flight, errorMessage] = await Flights.get(flightId);
    
    if (!flight) {
        return <div className={styles.page}>
            <div className={styles.container}>
                <h1>{errorMessage}</h1>
            </div>
        </div>;
    }

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}min`;
    };

    const formatDistance = (meters: number) => {
        return `${(meters / 1000).toFixed(1)} km`;
    };

    const formatAltitude = (alt: number) => {
        return `${alt}m`;
    };

    const stats: Stat[] = [
        {label: "Duration", value: formatDuration(flight.duration_sec)},
        {label: "Distance", value: formatDistance(flight.distance_meters)},
    ];

    return <div className={styles.page}>
        <div className={styles.container}>
            {/* Header Section */}
            <div className={flightStyles.header}>
                <div className={flightStyles.headerContent}>
                    <h1 className={flightStyles.title}>
                        🪂 {flight.wing} {flight.pilot && `by ${flight.pilot.first_name}`}
                    </h1>
                    <div className={flightStyles.subtitle}>
                        <ClientOnlyDate date={flight.start_date} format="full" />
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className={styles.section}>
                <Stats stats={stats}/>
            </div>

            {/* Flight Information Grid */}
            <div className={flightStyles.grid}>
                {/* Flight Details Card */}
                <div className={flightStyles.infoCard}>
                    <h3 className={flightStyles.infoTitle}>Flight Details</h3>
                    <div className={flightStyles.infoGrid}>
                        <div className={flightStyles.infoItem}>
                            <span className={flightStyles.infoLabel}>Wing</span>
                            <Link href={`/pilots/${flight.pilot_id}/${encodeURIComponent(flight.wing.toLowerCase())}`} className={flightStyles.infoValue} style={{textDecoration: 'none', color: 'var(--color-primary)', cursor: 'pointer'}}>
                                {flight.wing}
                            </Link>
                        </div>
                        <div className={flightStyles.infoItem}>
                            <span className={flightStyles.infoLabel}>Duration</span>
                            <span className={flightStyles.infoValue}>{formatDuration(flight.duration_sec)}</span>
                        </div>
                        <div className={flightStyles.infoItem}>
                            <span className={flightStyles.infoLabel}>Distance</span>
                            <span className={flightStyles.infoValue}>{formatDistance(flight.distance_meters)}</span>
                        </div>
                        <div className={flightStyles.infoItem}>
                            <span className={flightStyles.infoLabel}>Start Time</span>
                            <span className={flightStyles.infoValue}>
                                <ClientOnlyDate date={flight.start_date} format="time" />
                            </span>
                        </div>
                        {flight.pilot && (
                            <div className={flightStyles.infoItem}>
                                <span className={flightStyles.infoLabel}>Pilot</span>
                                <Link href={`/pilots/${flight.pilot.pilot_id}`} style={{textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-semibold)'}}>
                                    {flight.pilot.first_name}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sites Information Card */}
                <div className={flightStyles.infoCard}>
                    <h3 className={flightStyles.infoTitle}>Flight Path</h3>
                    <div className={flightStyles.siteGrid}>
                        {flight.takeoff?.slug ? (
                            <Link href={`/sites/${flight.takeoff.slug}`} className={flightStyles.site}>
                                <div className={flightStyles.siteIcon}>🛫</div>
                                <div className={flightStyles.siteLabel}>Takeoff</div>
                                <div className={flightStyles.siteName}>
                                    {flight.takeoff.name}
                                </div>
                                {flight.takeoff.alt && (
                                    <div className={flightStyles.siteAlt}>
                                        {formatAltitude(flight.takeoff.alt)}
                                    </div>
                                )}
                            </Link>
                        ) : (
                            <div className={flightStyles.site}>
                                <div className={flightStyles.siteIcon}>🛫</div>
                                <div className={flightStyles.siteLabel}>Takeoff</div>
                                <div className={flightStyles.siteName}>Unknown</div>
                            </div>
                        )}
                        <div className={flightStyles.arrow}>✈️</div>
                        {flight.landing?.slug ? (
                            <Link href={`/sites/${flight.landing.slug}`} className={flightStyles.site}>
                                <div className={flightStyles.siteIcon}>🛬</div>
                                <div className={flightStyles.siteLabel}>Landing</div>
                                <div className={flightStyles.siteName}>
                                    {flight.landing.name}
                                </div>
                                {flight.landing.alt && (
                                    <div className={flightStyles.siteAlt}>
                                        {formatAltitude(flight.landing.alt)}
                                    </div>
                                )}
                            </Link>
                        ) : (
                            <div className={flightStyles.site}>
                                <div className={flightStyles.siteIcon}>🛬</div>
                                <div className={flightStyles.siteLabel}>Landing</div>
                                <div className={flightStyles.siteName}>Unknown</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Description Section */}
            {flight.description && (
                <div className={flightStyles.infoCard}>
                    <h3 className={flightStyles.infoTitle}>Flight Description</h3>
                    <div style={{whiteSpace: 'pre-wrap', marginBottom: 'var(--space-4)', lineHeight: 'var(--line-height-relaxed)'}}>
                        {flight.description}
                    </div>
                    <div style={{display: 'flex', gap: 'var(--space-4)', alignItems: 'center'}}>
                        <ViewOnStrava flightId={flight.strava_activity_id}/>
                        <div className={styles.actionButton}>Update</div>
                    </div>
                </div>
            )}
        </div>
    </div>;
}