import {getActivity} from "@database/activities";
import Activity from "@ui/Activity";

export default async function PagePilot({params}: {
    params: Promise<{ activity_id: number }>
}) {
    const {activity_id} = await params
    const [activity, errorMessage] = await getActivity(activity_id);
    if (activity) {
        return <div>
            <Activity activity={activity}/>
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}