import {Takeoffs} from "@database/takeoffs";
import styles from "@styles/Page.module.css";



export default async function PageTakeOff({params}: {
    params: Promise<{ slug: string }>
}) {
    const {slug} = await params
    const [takeOff, errorMessage] = await Takeoffs.get(slug);
    if (takeOff) {
        return <div className={styles.page}>
            <h1>{takeOff.name}</h1>
            <h2>{takeOff.lat}, {takeOff.lng}, {takeOff.alt}</h2>
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}