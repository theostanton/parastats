import {StravaAthleteId, StravaActivityId} from "@parastats/common";
import Link from "next/link";
import styles from "./Links.module.css"

export default function ViewOnStrava({flightId}: { flightId: StravaActivityId }) {
    return <Link href={`https://strava.com/activities/${flightId}`}>
        <div className={styles.ViewOnStrava}>View on Strava</div>
    </Link>
}