import Link from "next/link";
import {Site} from "@model/Site";

export default function SiteLink({site}: { site: Site }) {
    return <Link href={`/sites/${site.slug}`}>{site.name}</Link>
}