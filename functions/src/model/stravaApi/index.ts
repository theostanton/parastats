import axios, {AxiosHeaders} from "axios";
import {StravaActivity, StravaActivitySummary, StravaAthlete} from "./model";
import {extractWing} from "../utils";
import {failed, Result, success} from "../model";

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

    async fetchWingedActivities(limit: number = 1): Promise<Result<StravaActivity[]>> {
        try {

            let relevantActivityIds: number[] = []
            let moreToFetch = true
            let page = 1
            while (moreToFetch && relevantActivityIds.length < limit) {
                const params: Record<string, any> = {
                    per_page: 200,
                    page: page
                }
                console.log(`Fetching page=${page}`)
                const response = await axios.get<StravaActivitySummary[]>('https://www.strava.com/api/v3/activities', {
                    params,
                    headers: this.headers
                });
                const relevantActivityIdsToAppend = response.data.filter(activity => activity.type === 'KiteSurf' || activity.type === "Workout").map(activity => activity.id);
                console.log(`Got page=${page} activities=${response.data.length} relevantActivityIds=${relevantActivityIdsToAppend.length}`);
                relevantActivityIds.push(...relevantActivityIdsToAppend);
                moreToFetch = response.data.length == 200
                page++
            }

            console.log("relevantActivityIds.length=", relevantActivityIds.length);
            const activities: StravaActivity[] = []
            for (const activityId of relevantActivityIds) {
                const result = await axios.get<StravaActivity>(`https://www.strava.com/api/v3/activities/${activityId}`, {headers: this.headers});
                const activity = result.data;
                if (extractWing(activity.description)) {
                    console.log(`Appending`);
                    activities.push(activity)
                } else {
                    console.log(`Skipped`);
                }
            }

            // const activities: (StravaActivity | null)[] = await Promise.all(relevantActivityIds
            //     .map(async (activityId) => {
            //         console.log(`Fetching description for ${activityId}`);
            //         const result = await axios.get<StravaActivity>(`https://www.strava.com/api/v3/activities/${activityId}`, {headers: this.headers});
            //         const activity = result.data;
            //         if (extractWing(activity.description) == null) {
            //             console.log(`Description for ${activityId} is not winged`);
            //             return null;
            //         }
            //         console.log(`Description for ${activityId} is winged`);
            //         return activity
            //     }))

            console.log(`Got ${activities.length} winged activities`);

            return success(activities.filter(activity => activity != null));
        } catch (err) {
            // @ts-ignore
            return failed(err.toString())
        }

    }

}