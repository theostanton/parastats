import {getAll} from "@database/pilots";
import styles from "@styles/Page.module.css";
import detailStyles from "@ui/DetailPages.module.css";
import pilotsStyles from "./Pilots.module.css";
import {Metadata} from "next";
import {createMetadata} from "@ui/metadata";
import PilotItem from "@ui/PilotItem";

export const metadata: Metadata = createMetadata('Pilots')

export default async function PagePilots() {
    const [pilots, errorMessage] = await getAll();
    
    if (errorMessage) {
        return <div className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.title}>Error loading pilots</h1>
                <div className={detailStyles.infoCard}>
                    <h3 className={detailStyles.infoTitle}>Failed to load pilot data</h3>
                    <div className={pilotsStyles.errorPadding}>
                        <strong>Error:</strong> {errorMessage}
                    </div>
                </div>
            </div>
        </div>
    }
    
    return <div className={styles.page}>
        <div className={styles.container}>
            <h1 className={styles.title}>Community Pilots</h1>
            <p className={styles.description}>
                Discover the paragliding community and connect with fellow pilots.
            </p>

            {/* Pilots List */}
            <div className={detailStyles.infoCard} style={{marginTop: 'var(--space-8)'}}>
                <h3 className={detailStyles.infoTitle}>Active Pilots ({pilots.length})</h3>
                <div className={pilotsStyles.pilotsList}>
                    {pilots.map(pilot => (
                        <PilotItem key={pilot.pilot_id} pilot={pilot} />
                    ))}
                </div>
                
                {pilots.length === 0 && (
                    <div className={pilotsStyles.noPilotsContainer}>
                        <p>No pilots found. Be the first to join the community!</p>
                    </div>
                )}
            </div>
        </div>
    </div>
}