'use client'

import styles from "@styles/Header.module.css";
import {signOut} from "../app/actions/signout";

export function SignOut() {
    return <div className={styles.navItem} onClick={() => signOut()}>Sign out</div>
}