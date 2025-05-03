import axios, {AxiosHeaders} from "axios";
import {StravaActivity, StravaActivitySummary, StravaAthlete} from "./model";
import {extractWing} from "../utils";

export function getClient(token: string): StravaApi {
    return new StravaApi(token);
}

export class StravaApi {

    headers: AxiosHeaders;

    constructor(token: string) {
        this.headers = new AxiosHeaders();
        this.headers.set('Authorization', `Bearer ${token}`);
    }

    async fetchAthlete(): Promise<StravaAthlete> {
        const response = await axios.get<StravaAthlete>('https://www.strava.com/api/v3/athlete', {headers: this.headers});
        return response.data
    }

    async fetchWingedActivities(): Promise<StravaActivity[]> {
        const response = await axios.get<StravaActivitySummary[]>('https://www.strava.com/api/v3/activities', {headers: this.headers});
        const relevantActivityIds = response.data.filter(activity => activity.type === 'KiteSurf' || activity.type === "Workout").map(activity => activity.id);
        const activities: (StravaActivity | null)[] = await Promise.all(relevantActivityIds
            .map(async (activityId) => {
                const result = await axios.get<StravaActivity>(`https://www.strava.com/api/v3/activities/${activityId}`, {headers: this.headers});
                const activity = result.data;
                if (extractWing(activity.description) == null) {
                    return null;
                }
                return activity
            }))

        return activities.filter(activity => activity != null) as StravaActivity[];

    }

}