import Link from "next/link";
import {Landing} from "@model/Landing";

export default function LandingLink({landing}: { landing: Landing }) {
    return <Link href={`/landings/${landing.slug}`}>↘️ {landing.name}</Link>
}