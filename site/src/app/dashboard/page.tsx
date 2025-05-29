import styles from "@styles/Page.module.css";
import {Metadata} from "next";
import {createMetadata} from "@ui/metadata";

export const metadata: Metadata = createMetadata('Dashboard')

export default function Welcome() {
    return <div className={styles.page}>
        <h1 className={styles.title}>
            Welcome to ParaStats.
        </h1>
    </div>
}
