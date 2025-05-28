import {getTakeOffs} from "@database/takeoffs";

export default async function PageTakeOffs() {
    const [takeOffs, errorMessage] = await getTakeOffs();
    if (takeOffs) {
        return <div>
            {takeOffs.map(takeOff =>
                <h3 key={takeOff.slug}><a href={`/takeoffs/${takeOff.slug}`}>{takeOff.name}</a></h3>
            )}
        </div>
    } else {
        return <h1>{errorMessage}</h1>
    }
}