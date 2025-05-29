import {getActivities} from "@database/activities";
import Activity from "@ui/Activity";
import styles from "@styles/Page.module.css";
import {Metadata} from "next";
import {createMetadata} from "@ui/metadata";

export const metadata: Metadata = createMetadata('Flights')

export default async function PageActivities() {
    const [activities, errorMessage] = await getActivities();
    if (activities) {
        return <div className={styles.page}>
            {activities.map(activity =>
                <Activity key={activity.activity_id} activity={activity}/>
            )}
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}