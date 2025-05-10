import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
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

                <h2>Coming soon...</h2>
            </main>

            <footer className={styles.footer}>
                <a href="https://theo.dev">
                    Built by theo.dev
                </a>
            </footer>
        </div>
    );
}
