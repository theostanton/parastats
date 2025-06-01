import {StravaAthleteId} from "@model/Pilot";
import Link from "next/link";
import {StravaActivityId} from "@model/Flight";
import styles from "./Links.module.css"

export default function ViewOnStrava({flightId}: { flightId: StravaActivityId }) {
    return <Link href={`https://strava.com/activities/${flightId}`}>
        <div className={styles.ViewOnStrava}>View on Strava</div>
    </Link>
}