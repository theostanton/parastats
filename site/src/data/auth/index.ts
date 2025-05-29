import {failure, Result, success} from "@model/Result";
import {jwtVerify} from "jose";
import {cookies} from "next/headers";

export namespace Auth {

    export async function assert() {
        const _cookies = await cookies();
        console.assert(_cookies.has("sid"), "Is not authed")
    }

    export async function getSelfPilotId(): Promise<number> {
        await assert()
        const _cookies = await cookies();
        const jwt = _cookies.get('sid').value

        const [userId, error] = await verifyJwt(jwt)
        if (error) {
            throw new Error("getSelfUserId Failed to get user id")
        }

        return userId
    }


    export async function checkIsAuthed(): Promise<boolean> {
        const jwt = (await cookies()).get('sid')?.value

        if (jwt) {
            const [_, error] = await verifyJwt(jwt)
            if (error) {
                console.log("checkIsAuthed", error)
                return false
            }
            return true
        } else {
            return false
        }
    }

    async function verifyJwt(sid: string): Promise<Result<number>> {
        if (!process.env.SESSION_SECRET?.length) {
            throw Error('Session Secret required');
        }

        try {
            const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET)

            console.log(`verifyJwt secretKey=${secretKey}`);

            const result = await jwtVerify(sid, secretKey);
            console.log('payload', result.payload);
            return success(result.payload.sub as unknown as number)
        } catch (error) {
            return failure(error.message)
        }
    }
}