import {StravaActivityId} from "@model/Flight";

export type TaskBody = WingActivityTask

export type WingActivityTask = {
    name: "WingActivity";
    flightId: StravaActivityId
}