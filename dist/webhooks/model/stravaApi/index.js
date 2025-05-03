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
    async fetchWingedActivities() {
        const response = await axios_1.default.get('https://www.strava.com/api/v3/activities', { headers: this.headers });
        const relevantActivityIds = response.data.filter(activity => activity.type === 'KiteSurf' || activity.type === "Workout").map(activity => activity.id);
        const activities = await Promise.all(relevantActivityIds
            .map(async (activityId) => {
            const result = await axios_1.default.get(`https://www.strava.com/api/v3/activities/${activityId}`, { headers: this.headers });
            const activity = result.data;
            if ((0, utils_1.extractWing)(activity.description) == null) {
                return null;
            }
            return activity;
        }));
        return activities.filter(activity => activity != null);
    }
}
exports.StravaApi = StravaApi;
