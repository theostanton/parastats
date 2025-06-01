import {TakeOff} from "@model/TakeOff";
import Link from "next/link";

export default function TakeoffLink({takeoff}: { takeoff: TakeOff }) {
    return <Link href={`/takeoffs/${takeoff.slug}`}>↗️ {takeoff.name}</Link>
}