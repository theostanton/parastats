import {Auth} from "@auth/index";
import {get} from "@database/pilots";
import {Flights} from "@database/flights";
import {getPilotWingStats} from "@database/stats";
import {Sites} from "@database/Sites";
import styles from "@styles/Page.module.css";
import detailStyles from "@ui/DetailPages.module.css";
import dashboardStyles from "./Dashboard.module.css";
import {Metadata} from "next";
import {createMetadata} from "@ui/metadata";
import FlightItem from "@ui/FlightItem";
import Link from "next/link";
import {formatSiteName} from "@utils/formatSiteName";

export const metadata: Metadata = createMetadata('Dashboard')

export default async function Dashboard() {
    const pilotId = await Auth.getSelfPilotId();
    
    // Run all database calls in parallel to reduce connection time
    const [
        [pilot, pilotErrorMessage],
        [wingStats, wingStatsErrorMessage], 
        [stats, takeoffStatsErrorMessage],
        [recentFlights, flightsErrorMessage],
        [totalFlightCount, flightCountErrorMessage]
    ] = await Promise.all([
        get(pilotId),
        getPilotWingStats(pilotId),
        Sites.getPilotStats(pilotId),
        Flights.getForPilot(pilotId, 3),
        Flights.getPilotFlightCount(pilotId)
    ]);
    
    // Check for any errors and display them
    const errors = [
        { error: pilotErrorMessage, description: "pilot data" },
        { error: wingStatsErrorMessage, description: "wing statistics" },
        { error: takeoffStatsErrorMessage, description: "site statistics" },
        { error: flightsErrorMessage, description: "recent flights" },
        { error: flightCountErrorMessage, description: "flight count" }
    ].filter(item => item.error);

    if (errors.length > 0) {
        return <div className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.title}>Dashboard Error</h1>
                <div className={detailStyles.infoCard}>
                    <h3 className={detailStyles.infoTitle}>Failed to load dashboard data</h3>
                    <div className={dashboardStyles.errorPadding}>
                        {errors.map((item, index) => (
                            <div key={index} className={dashboardStyles.errorItem}>
                                <strong>Error loading {item.description}:</strong> {item.error}
                            </div>
                        ))}
                    </div>
                    <div className={detailStyles.statsList}>
                        <Link href="/login" className={detailStyles.statsItem}>
                            <span className={detailStyles.statsItemName}>🔄 Try logging in again</span>
                            <span className={detailStyles.statsItemCount}>→</span>
                        </Link>
                        <Link href="/" className={detailStyles.statsItem}>
                            <span className={detailStyles.statsItemName}>🏠 Return to home</span>
                            <span className={detailStyles.statsItemCount}>→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    }
    
    const totalWings = wingStats.wingStats.length;
    const totalTakeoffs = stats.takeoffs.filter(item => item.site).length;
    const totalLandings = stats.landings.filter(item => item.site).length;

    return <div className={styles.page}>
        <div className={styles.container}>
            {/* Welcome Header */}
            <div className={detailStyles.header}>
                <div className={detailStyles.headerContent}>
                    <div className={dashboardStyles.headerFlex}>
                        {pilot.profile_image_url && (
                            <img 
                                src={pilot.profile_image_url} 
                                alt={pilot.first_name}
className={dashboardStyles.profileImage}
                            />
                        )}
                        <div>
                            <h1 className={detailStyles.title}>Welcome back, {pilot.first_name}! ✈️</h1>
                            <div className={detailStyles.subtitle}>
                                Your paragliding dashboard
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Overview */}
            <div className={detailStyles.grid}>
                <div className={detailStyles.infoCard}>
                    <h3 className={detailStyles.infoTitle}>Your Flying Summary</h3>
                    <div className={detailStyles.infoGrid}>
                        <Link href={`/pilots/${pilotId}`} className={detailStyles.infoItem}>
                            <span className={detailStyles.infoLabel}>Total Flights</span>
                            <span className={detailStyles.infoValue}>{totalFlightCount}</span>
                        </Link>
                        <div className={detailStyles.infoItem}>
                            <span className={detailStyles.infoLabel}>Wings Used</span>
                            <span className={detailStyles.infoValue}>{totalWings}</span>
                        </div>
                        <Link href="/sites" className={detailStyles.infoItem}>
                            <span className={detailStyles.infoLabel}>Takeoff Sites</span>
                            <span className={detailStyles.infoValue}>{totalTakeoffs}</span>
                        </Link>
                        <Link href="/sites" className={detailStyles.infoItem}>
                            <span className={detailStyles.infoLabel}>Landing Sites</span>
                            <span className={detailStyles.infoValue}>{totalLandings}</span>
                        </Link>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={detailStyles.infoCard}>
                    <h3 className={detailStyles.infoTitle}>Quick Actions</h3>
                    <div className={detailStyles.statsList}>
                        <Link href={`/pilots/${pilotId}`} className={detailStyles.statsItem}>
                            <span className={detailStyles.statsItemName}>👤 View Your Profile</span>
                            <span className={detailStyles.statsItemCount}>→</span>
                        </Link>
                        <Link href="/flights" className={detailStyles.statsItem}>
                            <span className={detailStyles.statsItemName}>🗂️ Browse All Flights</span>
                            <span className={detailStyles.statsItemCount}>→</span>
                        </Link>
                        <Link href="/sites" className={detailStyles.statsItem}>
                            <span className={detailStyles.statsItemName}>🏔️ Explore Sites</span>
                            <span className={detailStyles.statsItemCount}>→</span>
                        </Link>
                        <Link href="/pilots" className={detailStyles.statsItem}>
                            <span className={detailStyles.statsItemName}>👥 Community Pilots</span>
                            <span className={detailStyles.statsItemCount}>→</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Your Equipment */}
            {wingStats.wingStats.length > 0 && (
                <div className={detailStyles.infoCard}>
                    <h3 className={detailStyles.infoTitle}>🪂 Your Wings</h3>
                    <div className={detailStyles.statsList}>
                        {wingStats.wingStats.slice(0, 3).map(item => (
                            <Link 
                                key={item.wing} 
                                href={`/pilots/${pilotId}/${encodeURIComponent(item.wing.toLowerCase())}`}
                                className={detailStyles.statsItem}
                            >
                                <span className={detailStyles.statsItemName}>{item.wing}</span>
                                <span className={detailStyles.statsItemCount}>{item.flights} flights</span>
                            </Link>
                        ))}
                        {wingStats.wingStats.length > 3 && (
                            <Link href={`/pilots/${pilotId}`} className={detailStyles.statsItem}>
                                <span className={detailStyles.statsItemName}>View all wings...</span>
                                <span className={detailStyles.statsItemCount}>+{wingStats.wingStats.length - 3} more</span>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Your Favorite Sites */}
            {stats.takeoffs.filter(item => item.site).length > 0 && (
                <div className={detailStyles.infoCard}>
                    <h3 className={detailStyles.infoTitle}>↗️ Your Favorite Takeoffs</h3>
                    <div className={detailStyles.statsList}>
                        {stats.takeoffs
                            .filter(item => item.site)
                            .slice(0, 3)
                            .map(item => (
                                <Link 
                                    key={item.site.slug} 
                                    href={`/sites/${item.site.slug}`}
                                    className={detailStyles.statsItem}
                                >
                                    <span className={detailStyles.statsItemName}>{formatSiteName(item.site.name)}</span>
                                    <span className={detailStyles.statsItemCount}>{item.flights} flights</span>
                                </Link>
                            ))}
                        {stats.takeoffs.filter(item => item.site).length > 3 && (
                            <Link href={`/pilots/${pilotId}`} className={detailStyles.statsItem}>
                                <span className={detailStyles.statsItemName}>View all sites...</span>
                                <span className={detailStyles.statsItemCount}>→</span>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Recent Flights */}
            {recentFlights.length > 0 && (
                <div className={detailStyles.infoCard}>
                    <h3 className={detailStyles.infoTitle}>📅 Your Recent Flights</h3>
                    <div className={detailStyles.flightsList}>
                        {recentFlights.map(flight => (
                            <FlightItem key={flight.strava_activity_id} flight={flight} />
                        ))}
                    </div>
                    <div className={dashboardStyles.flightsSection}>
                        <Link href={`/pilots/${pilotId}`} className={detailStyles.statsItem}>
                            <span className={detailStyles.statsItemName}>View all your flights</span>
                            <span className={detailStyles.statsItemCount}>→</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* No flights message */}
            {recentFlights.length === 0 && (
                <div className={detailStyles.infoCard}>
                    <h3 className={detailStyles.infoTitle}>📅 Your Flights</h3>
                    <div className={dashboardStyles.noFlightsContainer}>
                        <p>No flights recorded yet. Start flying and sync your Strava activities to see them here!</p>
                        <Link href="/sites" className={`${detailStyles.statsItem} ${dashboardStyles.noFlightsAction}`}>
                            <span className={detailStyles.statsItemName}>🏔️ Explore flying sites</span>
                            <span className={detailStyles.statsItemCount}>→</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    </div>
}
