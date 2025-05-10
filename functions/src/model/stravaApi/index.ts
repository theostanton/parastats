import axios, {AxiosHeaders} from "axios";
import {StravaActivity, StravaActivitySummary, StravaAthlete} from "./model";
import {extractWing} from "../utils";
import {failed, Result, success} from "../model";
import {getDatabase} from "../database/client";
import * as stream from "node:stream";

export function getClient(token: string): StravaApi {
    return new StravaApi(token);
}

export class StravaApi {

    headers: AxiosHeaders;
    token: string;

    constructor(token: string) {
        this.token = token
        this.headers = new AxiosHeaders();
        this.headers.set('Authorization', `Bearer ${token}`);
        this.headers.set('Content-Type', `application/json`);
    }

    async fetchAthlete(): Promise<StravaAthlete> {
        const response = await axios.get<StravaAthlete>('https://www.strava.com/api/v3/athlete', {headers: this.headers});
        return response.data
    }

    async updateDescription(activityId: number, description: string): Promise<Result<void>> {
        console.log(`Update description ${activityId} to ${description} this.headers=${this.headers}`);
        try {
            const url = `https://www.strava.com/api/v3/activities/${activityId}`;
            console.log(`url=${url}`)
            const response = await axios.put<void>(url,
                {
                    description: description
                },
                {
                    headers: this.headers,
                }
            );
            if (response.status === 200) {
                return success(undefined)
            } else {
                return failed(`updateDescription failed status=${response.status} ${response}`);
            }
        } catch (error) {
            return failed(`updateDescription failed error=${error}`)
        }
    }

    async fetchWingedActivityIds(limit: number = 10000, ignoreActivityIds: number[] = []): Promise<Result<number[]>> {
        console.log(`fetchWingedActivityIds() limit=${limit} ignoreActivityIds=${ignoreActivityIds}`);
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
                const relevantActivityIdsToAppend = response.data.filter(activity => activity.type === 'Kitesurf' || activity.type === "Workout").map(activity => activity.id);
                console.log(`Got page=${page} activities=${response.data.length} relevantActivityIds=${relevantActivityIdsToAppend.length}`);
                let didIgnore = false
                relevantActivityIdsToAppend.forEach((relevantActivityId, index) => {

                    const shouldIgnore = ignoreActivityIds.filter(ignoreActivityId => relevantActivityId == ignoreActivityId).length > 0

                    if (shouldIgnore) {
                        // didIgnore = true
                        console.log(`${index + 1}/${relevantActivityIdsToAppend.length} Ignoring relevantActivityId=${relevantActivityId}`)
                    } else {
                        console.log(`${index + 1}/${relevantActivityIdsToAppend.length} Appending relevantActivityId=${relevantActivityId}`)
                        relevantActivityIds.push(relevantActivityId);
                    }
                })
                moreToFetch = !didIgnore && response.data.length == 200
                page++
            }

            return success(relevantActivityIds)
        } catch (err) {
            // @ts-ignore
            return failed(err.toString())
        }

    }

}