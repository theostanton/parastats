'use client'

import {Activity} from "@model/Activity";

export default function ActivityItem({activity}: { activity: Activity }) {
    return <a href={`/flights/${activity.activity_id}`}>
        <h1>{activity.activity_id} {activity.wing} {activity.distance_meters}m {activity.duration_sec}secs</h1>
    </a>
}