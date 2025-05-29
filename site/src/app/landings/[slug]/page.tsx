import {getLanding} from "@database/landings";
import styles from "@styles/Page.module.css";

export default async function PageLanding({params}: {
    params: Promise<{ slug: string }>
}) {
    const {slug} = await params
    const [landing, errorMessage] = await getLanding(slug);
    if (landing) {
        return <div className={styles.page}>
            <h1>{landing.name}</h1>
            <h2>{landing.lat}, {landing.lng}, {landing.alt}</h2>
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}