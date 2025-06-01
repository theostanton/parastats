import {Landings} from "@database/landings";
import styles from "@styles/Page.module.css";
import {Metadata} from "next";
import {createMetadata} from "@ui/metadata";

export const metadata: Metadata = createMetadata('Landings')

export default async function PageLandings() {
    const [landings, errorMessage] = await Landings.getAll();
    if (landings) {
        return <div className={styles.page}>
            {landings.map(landing =>
                <h3 key={landing.slug}><a href={`/landings/${landing.slug}`}>{landing.name}</a></h3>
            )}
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}