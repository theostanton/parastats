import "@styles/globals.css";
import styles from '@styles/Layout.module.css';


export default function Layout({children}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={styles.body}>
        <div className={styles.header}>
            <h1>🪂 Parastats</h1>
            <ul>
                <li><a href={'/'}>Home</a></li>
                <li><a href={'/login'}>Login</a></li>
                <li><a href={'/pilots'}>Pilots</a></li>
                <li><a href={'/activities'}>Activities</a></li>
                <li><a href={'/takeoffs'}>Take Off Sites</a></li>
                <li><a href={'/landings'}>Landing Sites</a></li>
            </ul>
        </div>
        <div className={styles.container}>
            {children}
        </div>
        </body>
        </html>
    )
}