'use server'

import {cookies} from "next/headers";
import {redirect} from "next/navigation";

export async function updateDescription(flightId: string) {
    console.log('updateDescription()')
    const cookieStore = await cookies()
    cookieStore.delete('sid')
    redirect('/login')
}