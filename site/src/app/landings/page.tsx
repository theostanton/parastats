import {getLandings} from "@database/landings";

export default async function PageLandings() {
    const [landings, errorMessage] = await getLandings();
    if (landings) {
        return <div>
            {landings.map(landing =>
                <h3 key={landing.slug}><a href={`/landings/${landing.slug}`}>{landing.name}</a></h3>
            )}
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}