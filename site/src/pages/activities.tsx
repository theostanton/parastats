import Head from "next/head";
import styles from "../styles/Home.module.css";
import {GetServerSideProps, InferGetServerSidePropsType, NextPageContext} from "next";
import {User} from "@model/User";
import {GetServerSidePropsResult} from "next/dist/types";
import {ParastatsApi} from "../api";

type Props = {
    success: boolean
    user: User | null
}

// export const getServerSideProps = (async (context) => {
//     console.log('getServerSideProps()')
//     const cookies = context.req.headers.cookie;
//
//     // const sid = cookies['sid']
//     // console.log('sid',sid)
//     console.log('cookies',cookies)
//     // Fetch data from external API
//     const api = new ParastatsApi()
//     const [data, error] = await api.getSelf()
//     if (error) {
//         return {
//             props: {
//                 success: false,
//                 user: null
//             }
//         }
//     } else {
//         return {
//             props: {
//                 success: true,
//                 user: data
//             }
//
//         }
//     }
// }) satisfies GetServerSideProps<Props>

export async function getServerSideProps(context: any): Promise<GetServerSidePropsResult<Props>> {
    console.log('getServerSideProps()')
    // const cookies = context.req.cookies['sid'];

    const api = new ParastatsApi(context.req.cookies['sid'])
    const [data, error] = await api.getSelf()

    if (error) {
        console.log('error', error)
        return {
            props: {
                success: false,
                user: null
            }
        }
    }
    console.log('data', data)
    return {
        props: {
            success: true,
            user: data
        }
    }
}

export default function Activities(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
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

                <h2>Hello ${props.user?.first_name}</h2>
            </main>

            <footer className={styles.footer}>
                <a href="https://theo.dev">
                    Built by theo.dev
                </a>
            </footer>
        </div>
    );
}
