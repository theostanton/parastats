import "@styles/globals.css";
import styles from '@styles/Layout.module.css';
import Header from "@ui/Header";
import Breadcrumb from "@ui/Breadcrumb";
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
        <Breadcrumb/>
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