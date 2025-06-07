import Link from "next/link";
import {Site} from "@parastats/common";

export default function SiteLink({site}: { site: Site }) {
    return <Link href={`/sites/${site.slug}`}>{site.name}</Link>
}