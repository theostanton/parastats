import Head from "next/head";
import styles from "../styles/Home.module.css";
import {GetServerSideProps, InferGetServerSidePropsType} from "next";
import {ParastatsApi} from "../api";
import {User} from "../model/User";

type Props = {
    success: boolean
    user: User | undefined
}

export const getServerSideProps = (async () => {
    console.log('getServerSideProps()')
    // Fetch data from external API
    const api = new ParastatsApi("blah")
    const [data, error] = await api.getSelf()
    if (error) {
        return {
            props: {
                success: false,
                user: undefined
            }
        }
    } else {
        return {
            props: {
                success: true,
                user: data
            }

        }
    }
}) satisfies GetServerSideProps<Props>

export default function Home(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    console.log(`props=${JSON.stringify(props)}`)
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
                    {props.success ? `${props.user.first_name}` : `Failed`}
                    <a className={styles.connectButton}
                       href="https://www.strava.com/oauth/authorize?client_id=155420&redirect_uri=https%3A%2F%2Fwebhooks.parastats.info&response_type=code&approval_prompt=force&scope=read_all,activity:write,activity:read_all">
                        Connect with Strava
                    </a>
                </p>
            </main>

            <footer className={styles.footer}>
                <a href="https://theo.dev">
                    Build by theo.dev
                </a>
            </footer>
        </div>
    );
}
