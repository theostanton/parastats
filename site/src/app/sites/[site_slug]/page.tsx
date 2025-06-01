import styles from "@styles/Page.module.css";
import {Metadata} from "next";
import {createMetadata} from "@ui/metadata";
import {Sites} from "@database/Sites";

export const metadata: Metadata = createMetadata("Site")

export default async function SiteDetail({params}: {
    params: Promise<{ site_slug: string }>
}) {
    const slug = (await params).site_slug
    const [site, errorMessage] = await Sites.getForSlug(slug);
    if (site) {
        return <div className={styles.page}>
            <h1>{site.name}</h1>
            <p>{site.lat},{site.lng},{site.alt}</p>
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}