import styles from "@styles/Page.module.css";
import {Metadata} from "next";
import {createMetadata} from "@ui/metadata";

export const metadata: Metadata = createMetadata('Login')

export default function Login() {
    return <div className={styles.page}>
        <h1>
            Welcome to ParaStats.
        </h1>

        <p className={styles.description}>
            <a className={styles.connectButton}
               href="https://www.strava.com/oauth/authorize?client_id=155420&redirect_uri=https%3A%2F%2Fwebhooks.parastats.info&response_type=code&approval_prompt=force&scope=read_all,activity:write,activity:read_all">
                Connect with Strava
            </a>
        </p>
    </div>
}
