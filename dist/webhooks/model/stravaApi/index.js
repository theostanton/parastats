"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StravaApi = void 0;
exports.getClient = getClient;
const axios_1 = __importStar(require("axios"));
const utils_1 = require("../utils");
const model_1 = require("../model");
function getClient(token) {
    return new StravaApi(token);
}
class StravaApi {
    constructor(token) {
        this.headers = new axios_1.AxiosHeaders();
        this.headers.set('Authorization', `Bearer ${token}`);
    }
    async fetchAthlete() {
        const response = await axios_1.default.get('https://www.strava.com/api/v3/athlete', { headers: this.headers });
        return response.data;
    }
    async fetchWingedActivities(limit = 20) {
        try {
            let relevantActivityIds = [];
            let moreToFetch = true;
            let page = 1;
            while (moreToFetch && relevantActivityIds.length < limit) {
                const params = {
                    per_page: 200,
                    page: page
                };
                console.log(`Fetching page=${page}`);
                const response = await axios_1.default.get('https://www.strava.com/api/v3/activities', {
                    params,
                    headers: this.headers
                });
                const relevantActivityIdsToAppend = response.data.filter(activity => activity.type === 'KiteSurf' || activity.type === "Workout").map(activity => activity.id);
                console.log(`Got page=${page} activities=${response.data.length} relevantActivityIds=${relevantActivityIdsToAppend.length}`);
                relevantActivityIds.push(...relevantActivityIdsToAppend);
                moreToFetch = response.data.length == 200;
                page++;
            }
            console.log("relevantActivityIds.length=", relevantActivityIds.length);
            const activities = [];
            for (const activityId of relevantActivityIds) {
                const result = await axios_1.default.get(`https://www.strava.com/api/v3/activities/${activityId}`, { headers: this.headers });
                const activity = result.data;
                if ((0, utils_1.extractWing)(activity.description)) {
                    console.log(`Appending`);
                    activities.push(activity);
                }
                else {
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
            return (0, model_1.success)(activities.filter(activity => activity != null));
        }
        catch (err) {
            // @ts-ignore
            return (0, model_1.failed)(err.toString());
        }
    }
}
exports.StravaApi = StravaApi;
