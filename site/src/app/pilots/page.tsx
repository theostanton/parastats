import {getTakeOffs} from "@database/takeoffs";
import {getPilots} from "@database/pilots";

export default async function PagePilots() {
    const [pilots, errorMessage] = await getPilots();
    if (pilots) {
        return <div>
            {pilots.map(pilot =>
                <h3 key={pilot.user_id}><a href={`/pilots/${pilot.user_id}`}>{pilot.first_name}</a></h3>
            )}
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}