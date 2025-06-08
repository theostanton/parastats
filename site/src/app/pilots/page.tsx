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
                <div key={pilot.pilot_id} style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                    {pilot.profile_image_url && (
                        <img 
                            src={pilot.profile_image_url} 
                            alt={pilot.first_name}
                            style={{
                                width: '3rem',
                                height: '3rem',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '1px solid var(--color-border)'
                            }}
                        />
                    )}
                    <h3><a href={`/pilots/${pilot.pilot_id}`}>{pilot.first_name}</a></h3>
                </div>
            )}
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}