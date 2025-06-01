import {Stat} from "@ui/stats/model";
import StatItem from "@ui/stats/StatItem";
import styles from "./Stats.module.css";

export default function Stats({stats}: { stats: Stat[] }) {
    return <div className={styles.container}>{stats.map(item => (
        <StatItem key={item.label} label={item.label} value={item.value}/>))}
    </div>
}