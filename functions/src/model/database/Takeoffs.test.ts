import {expect, test} from "vitest";
import {TestContainer} from "./generateContainer.test";
import {Takeoffs} from "./Takeoffs";
import {Takeoff} from "./model";
import {Mocks} from "./Mocks.test";
import closestLanding = Mocks.leBoisDuBouchet;
import anotherLanding = Mocks.leSavoy;


test('Takeoffs.upsert() ', async () => {
    const container = await TestContainer.generateEmpty()

    await Takeoffs.upsert([Mocks.planpraz, Mocks.forclaz])

    await container.stop()
})

test('Takeoffs.getSlugOfClosest() ', async () => {
    const container = await TestContainer.generateEmpty()

    await Takeoffs.upsert([Mocks.planpraz, Mocks.forclaz])

    const result = await Takeoffs.getSlugOfClosest([anotherLanding.lat, anotherLanding.lng])

    expect(result).toEqual(Mocks.planpraz.slug)

    await container.stop()

})