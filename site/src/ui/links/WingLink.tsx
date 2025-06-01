import Link from "next/link";
import {StravaAthleteId} from "@model/Pilot";

export default function WingLink({wing, pilotId}: { wing: string, pilotId: StravaAthleteId }) {
    return <Link href={`/pilots/${pilotId}/${wing}`}>🪂 {wing}</Link>
}