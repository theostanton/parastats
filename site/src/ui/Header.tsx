import {Auth} from "@auth/index";
import styles from "@styles/Header.module.css";
import {SignOut} from "@ui/SignOut";


enum AuthRequired {
    Authed, NotAuthed, Always
}

function shouldShow(authRequired: AuthRequired, isAuthed: boolean): boolean {
    switch (authRequired) {
        case AuthRequired.Authed:
            return isAuthed
        case AuthRequired.NotAuthed:
            return !isAuthed
        case AuthRequired.Always:
            return true
    }
}

type NavItem = {
    auth: AuthRequired
    text: string
    path: string
}

function NavItem(props: { text: string, path: string }) {
    return <a className={styles.navItem} href={props.path}>
        <div className={styles.navText}>{props.text}</div>
    </a>
}

export default async function Header() {
    const isAuthed = await Auth.checkIsAuthed()
    const navItems: NavItem[] = [
        {text: "Home", path: "/", auth: AuthRequired.Always},
        {text: "Dashboard", path: "/dashboard", auth: AuthRequired.Authed},
        {text: "Login", path: "/login", auth: AuthRequired.NotAuthed},
        {text: "Pilots", path: "/pilots", auth: AuthRequired.Always},
        {text: "Flights", path: "/flights", auth: AuthRequired.Always},
        {text: "Sites", path: "/sites", auth: AuthRequired.Always},
    ]

    return <div className={styles.container}>
        <div className={styles.content}>
            <a href="/" className={styles.headerTitle}>
                <span>🪂</span>
                <span>Paraglider Stats</span>
            </a>
            <nav className={styles.nav}>
                <div className={styles.mobileNav}>
                    {navItems.filter((item) => shouldShow(item.auth, isAuthed))
                        .map((item) => <NavItem key={item.text} {...item}/>
                        )
                    }
                    {isAuthed && <SignOut/>}
                </div>
            </nav>
        </div>
    </div>
}