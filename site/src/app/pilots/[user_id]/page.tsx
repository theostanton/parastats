import {getPilot} from "@database/pilots";
import {getActivitiesForPilot} from "@database/activities";
import Activity from "@ui/Activity";
import {getPilotWingStats} from "@database/stats";
import styles from "@styles/Page.module.css";
import {Metadata, ResolvingMetadata} from "next";
import {createMetadata} from "@ui/metadata";

type Params = { user_id: number };

export async function generateMetadata(
    {params}: { params: Promise<Params> },
    parent: ResolvingMetadata
): Promise<Metadata> {

    const user_id = (await params).user_id
    const [pilot, pilotErrorMessage] = await getPilot(user_id);
    if (pilotErrorMessage) {
        return createMetadata()
    }
    return createMetadata(pilot.first_name)
}


export default async function PagePilot({params}: {
    params: Promise<Params>
}) {
    const {user_id} = await params
    const [pilot, pilotErrorMessage] = await getPilot(user_id);
    if (pilotErrorMessage) {
        return <h1>pilotErrorMessage={pilotErrorMessage}</h1>
    }

    const [wingStats, wingStatsErrorMessage] = await getPilotWingStats(user_id);
    if (wingStatsErrorMessage) {
        return <h1>wingStatsErrorMessage={wingStatsErrorMessage}</h1>
    }

    const [activities, activitiesErrorMessage] = await getActivitiesForPilot(user_id, 5);
    if (activitiesErrorMessage) {
        return <h1>activitiesErrorMessage={activitiesErrorMessage}</h1>
    }

    return <div className={styles.page}>
        <h1>{pilot.first_name}</h1>
        <h3>Wings</h3>
        {wingStats.wingStats.map(item => (
            <a key={item.wing} href={`/pilots/${user_id}/${item.wing.toLowerCase()}`}>
                <div>{item.wing} • {item.flights} flights</div>
            </a>
        ))}

        <h3>Recent activities</h3>
        {activities.map(activity => <Activity key={activity.activity_id} activity={activity}/>)}
    </div>
}