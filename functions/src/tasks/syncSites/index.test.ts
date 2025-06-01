import {expect, test} from "vitest";
import initialiseUser, {convertToSite} from "./index";
import {Site} from "../../model/database/model";
import {FfvlSite} from "../../model/ffvlApi";


const convertCases: [title: string, input: FfvlSite, expected: Site][] = [
    [
        "With polygon",
        {
            longitude: "1.1",
            latitude: "2.2",
            altitude: "333",
            flying_functions_text: null,
            terrain_polygon: "[[1.1, 1.2], [2.1, 2.2], [3.1, 3.2]]",
            suid: "sid",
            toponym: "Some name",
        },
        {
            slug: "some-name",
            lng: 1.1,
            lat: 2.2,
            alt: 333,
            type: null,
            polygon: [[1.1, 1.2], [2.1, 2.2], [3.1, 3.2]],
            ffvl_sid: "sid",
            name: "Some name",
            nearest_balise_id: null,
        }
    ],
    [
        "Without polylgon",
        {
            longitude: "1.1",
            latitude: "2.2",
            altitude: "333",
            flying_functions_text: null,
            terrain_polygon: undefined,
            suid: "sid",
            toponym: "Some name"
        },
        {
            slug: "some-name",
            lng: 1.1,
            lat: 2.2,
            alt: 333,
            type: null,
            polygon: null,
            ffvl_sid: "sid",
            name: "Some name",
            nearest_balise_id: null,
        }
    ]
]

test.each(convertCases)('convertToSite(%s)', (_, input, expected) => {
    const actual = convertToSite(input, [])
    expect(actual).toEqual(expected)
})