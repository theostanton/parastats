import {getPilot} from "@database/pilots";
import {getActivitiesForPilot, getActivitiesForPilotAndWing} from "@database/activities";
import Activity from "@ui/Activity";
import styles from "@styles/Page.module.css";

export default async function PagePilot({params}: {
    params: Promise<{ user_id: number, wing: string }>
}) {
    const {user_id, wing} = await params
    console.log('user_id', user_id, 'wing', wing)
    const [pilot, pilotErrorMessage] = await getPilot(user_id);
    if (pilotErrorMessage) {
        return <h1>pilotErrorMessage={pilotErrorMessage}</h1>
    }

    const [activities, activitiesErrorMessage] = await getActivitiesForPilotAndWing(user_id, wing);
    if (activitiesErrorMessage) {
        return <h1>activitiesErrorMessage={activitiesErrorMessage}</h1>
    }

    return <div className={styles.page}>
        <h1>{pilot.first_name} • {wing}</h1>
        <h3>{activities.length} activities</h3>
        {activities.map(activity => <Activity key={activity.activity_id} activity={activity}/>)}
    </div>
}