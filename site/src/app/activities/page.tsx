import {getTakeOffs} from "@database/takeoffs";
import {getPilots} from "@database/pilots";
import {getActivities} from "@database/activities";
import Activity from "@ui/Activity";

export default async function PageActivities() {
    const [activities, errorMessage] = await getActivities();
    if (activities) {
        return <div>
            {activities.map(activity =>
                <Activity key={activity.activity_id} activity={activity}/>
            )}
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}