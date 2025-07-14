import styles from "@styles/Page.module.css";
import {Metadata} from "next";
import {createMetadata} from "@ui/metadata";

export const metadata: Metadata = createMetadata('Login')

export default function Login() {
    return <div className={styles.loginPageContainer}>
        <div className={styles.loginContent}>
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🪂</div>
                <h1 className={styles.title} style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-3)' }}>
                    Welcome to Paraglider Stats
                </h1>
                <p className={styles.subtitle} style={{ fontSize: 'var(--font-size-lg)', marginBottom: '0' }}>
                    Track your paragliding adventures with data from Strava
                </p>
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
                <p className={styles.description} style={{ fontSize: 'var(--font-size-base)', marginBottom: '0' }}>
                    Connect your Strava account to automatically sync your paragliding flights 
                    and get detailed insights into your flying performance.
                </p>
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
                <a className={styles.stravaButton}
                   href="https://www.strava.com/oauth/authorize?client_id=155420&redirect_uri=https%3A%2F%2Fwebhooks.paragliderstats.com&response_type=code&approval_prompt=force&scope=read_all,activity:write,activity:read_all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.172"/>
                    </svg>
                    Connect with Strava
                </a>
            </div>

            <div className={styles.loginFeatures}>
                <h3 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                    What you'll get:
                </h3>
                <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    <li style={{ marginBottom: 'var(--space-1)' }}>Automatic flight detection</li>
                    <li style={{ marginBottom: 'var(--space-1)' }}>Performance metrics</li>
                    <li style={{ marginBottom: 'var(--space-1)' }}>Site identification</li>
                    <li>AI flight descriptions</li>
                </ul>
            </div>
        </div>
    </div>
}
