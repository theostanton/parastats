import styles from "@styles/Page.module.css";
import {Metadata} from "next";
import {createMetadata} from "@ui/metadata";
import {Sites} from "@database/Sites";
import SiteLink from "@ui/links/SiteLink";

export const metadata: Metadata = createMetadata('Sites')

export default async function SitesList() {
    const [sites, errorMessage] = await Sites.getAll();
    if (sites) {
        return <div className={styles.page}>
            {sites.map(site =>
                <SiteLink key={site.ffvl_sid} site={site}/>
            )}
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}