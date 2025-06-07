'use client'

import {FlightWithSites} from "@parastats/common";
import Link from "next/link";
import Stats from "@ui/stats/Stats";
import {Stat} from "@ui/stats/model";
import ViewOnStrava from "@ui/links/ViewOnStrava";
import styles from "./FlightItem.module.css"
import VerticalSpace from "@ui/VerticalSpace";

export default function FlightItem({flight}: { flight: FlightWithSites }) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

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

    return <div className={styles.container}>
        <Link href={`/flights/${flight.strava_activity_id}`} className={styles.mainContent}>
            <div className={styles.header}>
                <div className={styles.flightInfo}>
                    <div className={styles.wing}>🪂 {flight.wing}</div>
                    <div className={styles.date}>{formatDate(flight.start_date)}</div>
                </div>
                <div className={styles.metrics}>
                    <div className={styles.metric}>
                        <span className={styles.metricValue}>{formatDuration(flight.duration_sec)}</span>
                        <span className={styles.metricLabel}>Duration</span>
                    </div>
                    <div className={styles.metric}>
                        <span className={styles.metricValue}>{formatDistance(flight.distance_meters)}</span>
                        <span className={styles.metricLabel}>Distance</span>
                    </div>
                </div>
            </div>
            
            <div className={styles.sites}>
                <div className={styles.site}>
                    <div className={styles.siteIcon}>🚁</div>
                    <div className={styles.siteInfo}>
                        <div className={styles.siteLabel}>Takeoff</div>
                        <div className={styles.siteName}>{flight.takeoff?.name || 'Unknown'}</div>
                    </div>
                </div>
                <div className={styles.siteArrow}>→</div>
                <div className={styles.site}>
                    <div className={styles.siteIcon}>🎯</div>
                    <div className={styles.siteInfo}>
                        <div className={styles.siteLabel}>Landing</div>
                        <div className={styles.siteName}>{flight.landing?.name || 'Unknown'}</div>
                    </div>
                </div>
            </div>
        </Link>
        
        <div className={styles.actions}>
            <ViewOnStrava flightId={flight.strava_activity_id}/>
        </div>
    </div>
}