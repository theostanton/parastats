import styles from "@styles/Page.module.css";
import {Metadata} from "next";
import {createMetadata} from "@ui/metadata";
import {Sites} from "@database/Sites";
import SitesList from "@ui/SitesList";

export const metadata: Metadata = createMetadata('Sites')

export default async function SitesPage() {
    const [sites, errorMessage] = await Sites.getAllWithFlightCounts();
    if (sites) {
        return <div className={styles.page}>
            <div className={styles.container}>
                <header className={styles.pageHeader}>
                    <h1 className={styles.title}>Flying Sites</h1>
                    <p className={styles.description}>
                        Discover paragliding sites with detailed location information and flight data.
                    </p>
                </header>

                <SitesList sites={sites} />
            </div>
        </div>
    } else {
        return <div className={styles.page}>
            <div className={styles.container}>
                <h1>{errorMessage}</h1>
            </div>
        </div>
    }
}