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
const model_1 = require("../model");
function getClient(token) {
    return new StravaApi(token);
}
class StravaApi {
    constructor(token) {
        this.token = token;
        this.headers = new axios_1.AxiosHeaders();
        this.headers.set('Authorization', `Bearer ${token}`);
        this.headers.set('Content-Type', `application/json`);
    }
    async fetchAthlete() {
        const response = await axios_1.default.get('https://www.strava.com/api/v3/athlete', { headers: this.headers });
        return response.data;
    }
    async updateDescription(activityId, description) {
        console.log(`Update description ${activityId} to ${description} this.headers=${this.headers}`);
        try {
            const url = `https://www.strava.com/api/v3/activities/${activityId}`;
            console.log(`url=${url}`);
            const response = await axios_1.default.put(url, {
                description: description
            }, {
                headers: this.headers,
            });
            if (response.status === 200) {
                return (0, model_1.success)(undefined);
            }
            else {
                return (0, model_1.failed)(`updateDescription failed status=${response.status} ${response}`);
            }
        }
        catch (error) {
            return (0, model_1.failed)(`updateDescription failed error=${error}`);
        }
    }
    async fetchWingedActivityIds(limit = 10000, ignoreActivityIds = []) {
        console.log(`fetchWingedActivityIds() limit=${limit} ignoreActivityIds=${ignoreActivityIds}`);
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
                const relevantActivityIdsToAppend = response.data.filter(activity => activity.type === 'Kitesurf' || activity.type === "Workout").map(activity => activity.id);
                console.log(`Got page=${page} activities=${response.data.length} relevantActivityIds=${relevantActivityIdsToAppend.length}`);
                let didIgnore = false;
                relevantActivityIdsToAppend.forEach((relevantActivityId, index) => {
                    const shouldIgnore = ignoreActivityIds.filter(ignoreActivityId => relevantActivityId == ignoreActivityId).length > 0;
                    if (shouldIgnore) {
                        // didIgnore = true
                        console.log(`${index + 1}/${relevantActivityIdsToAppend.length} Ignoring relevantActivityId=${relevantActivityId}`);
                    }
                    else {
                        console.log(`${index + 1}/${relevantActivityIdsToAppend.length} Appending relevantActivityId=${relevantActivityId}`);
                        relevantActivityIds.push(relevantActivityId);
                    }
                });
                moreToFetch = !didIgnore && response.data.length == 200;
                page++;
            }
            return (0, model_1.success)(relevantActivityIds);
        }
        catch (err) {
            // @ts-ignore
            return (0, model_1.failed)(err.toString());
        }
    }
}
exports.StravaApi = StravaApi;
