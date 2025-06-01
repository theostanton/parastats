import {Takeoffs} from "@database/takeoffs";
import styles from "@styles/Page.module.css";
import {Metadata} from "next";
import {createMetadata} from "@ui/metadata";

export const metadata: Metadata = createMetadata('Take Offs')

export default async function PageTakeOffs() {
    const [takeOffs, errorMessage] = await Takeoffs.getAll();
    if (takeOffs) {
        return <div className={styles.page}>
            {takeOffs.map(takeOff =>
                <h3 key={takeOff.slug}><a href={`/takeoffs/${takeOff.slug}`}>{takeOff.name}</a></h3>
            )}
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}