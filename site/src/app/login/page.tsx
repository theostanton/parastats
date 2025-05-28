import Head from "next/head";
import styles from "@styles/Home.module.css";

export default function Login() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Parastats</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className={styles.main}>

                <h1 className={styles.title}>
                    Welcome to ParaStats.
                </h1>

                <p className={styles.description}>
                    <a className={styles.connectButton}
                       href="https://www.strava.com/oauth/authorize?client_id=155420&redirect_uri=https%3A%2F%2Fwebhooks.parastats.info&response_type=code&approval_prompt=force&scope=read_all,activity:write,activity:read_all">
                        Connect with Strava
                    </a>
                </p>
            </main>

            <footer className={styles.footer}>
                <a href="https://theo.dev">
                    Built by theo.dev
                </a>
            </footer>
        </div>
    );
}
