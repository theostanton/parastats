import {expect, test} from "vitest";
import {TestContainer} from "./generateContainer.test";
import {Site} from "./model";
import {Sites} from "./Sites";


test('Sites.upsert() ', async () => {
    const container = await TestContainer.generateEmpty()

    const sites: Site[] = [
        {
            slug: "some-slug",
            lng: 1.1,
            lat: 2.2,
            alt: 333,
            type: null,
            polygon: [[1.1, 1.2], [2.1, 2.2], [3.1, 3.2]],
            nearest_balise_id: null,
            ffvl_sid: "sid",
            name: "Some name"
        }
    ]

    const insertResult = await Sites.upsert(sites)
    expect(insertResult.success).toEqual(true)

    const upsertResult = await Sites.upsert(sites)
    expect(upsertResult.success).toEqual(true)

    await container.stop()
})
