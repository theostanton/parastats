import {getPilot} from "@database/pilots";
import {getActivitiesForPilot} from "@database/activities";
import Activity from "@ui/Activity";

export default async function PagePilot({params}: {
    params: Promise<{ user_id: number }>
}) {
    const {user_id} = await params
    const [pilot, pilotErrorMessage] = await getPilot(user_id);
    if (pilotErrorMessage) {
        return <h1>pilotErrorMessage={pilotErrorMessage}</h1>
    }

    const [activities, activitiesErrorMessage] = await getActivitiesForPilot(user_id);
    if (activitiesErrorMessage) {
        return <h1>activitiesErrorMessage={activitiesErrorMessage}</h1>
    }

    return <div>
        <h1>{pilot.first_name}</h1>
        {activities.map(activity => <Activity key={activity.activity_id} activity={activity}/>)}
    </div>
}