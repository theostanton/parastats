import "@styles/globals.css";
import styles from '@styles/Layout.module.css';
import Header from "@ui/Header";
import {Metadata} from "next";
import {createMetadata} from "@ui/metadata";

export const metadata: Metadata = createMetadata()


export default function Layout({children}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={styles.body}>
        <Header/>
        <div className={styles.container}>
            {children}
        </div>
        <footer className={styles.footer}>
            <a href="https://theo.dev">
                Built by theo.dev
            </a>
        </footer>
        </body>
        </html>
    )
}