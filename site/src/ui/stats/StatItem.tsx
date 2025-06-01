import styles from "./Stats.module.css";

export default function StatItem({label, value}: { label: string, value: string }) {
    return <div className={styles.item}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{value}</div>
    </div>
}