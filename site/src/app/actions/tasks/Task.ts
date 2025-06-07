import {StravaActivityId} from "@parastats/common";

export type TaskBody = WingActivityTask

export type WingActivityTask = {
    name: "WingActivity";
    flightId: StravaActivityId
}