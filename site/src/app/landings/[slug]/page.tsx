import {getLanding} from "@database/landings";

export default async function PageLanding({params}: {
    params: Promise<{ slug: string }>
}) {
    const {slug} = await params
    const [landing, errorMessage] = await getLanding(slug);
    if (landing) {
        return <div>
            <h1>{landing.name}</h1>
            <h2>{landing.lat}, {landing.lng}, {landing.alt}</h2>
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}