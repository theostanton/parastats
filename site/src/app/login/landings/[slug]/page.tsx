import {getTakeOff} from "@database/takeoffs";

export default async function PageTakeOff({params}: {
    params: Promise<{ slug: string }>
}) {
    const {slug} = await params
    const [takeOff, errorMessage] = await getTakeOff(slug);
    if (takeOff) {
        return <div>
            <h1>{takeOff.name}</h1>
            <h2>{takeOff.lat}, {takeOff.lng}, {takeOff.alt}</h2>
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}