import {getAll} from "@database/pilots";
import styles from "@styles/Page.module.css";
import {Metadata} from "next";
import {createMetadata} from "@ui/metadata";

export const metadata: Metadata = createMetadata('Pilots')

export default async function PagePilots() {
    const [pilots, errorMessage] = await getAll();
    if (pilots) {
        return <div className={styles.page}>
            {pilots.map(pilot =>
                <h3 key={pilot.pilot_id}><a href={`/pilots/${pilot.pilot_id}`}>{pilot.first_name}</a></h3>
            )}
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}