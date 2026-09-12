import { describe, expect, it } from 'vitest'
import { matchWingByName } from './wingMatch'
import type { Wing } from './model'

/**
 * Which wings row a pilot means by what they typed on Strava.
 *
 * The case these tests were written for: a pilot wrote `🪂 Epic`, the wings
 * table held "BGD Epic" because that is how the catalogue names gliders, an
 * exact fold of the whole name matched nothing, and the flight was published
 * with no wing on it at all.
 */

function wing(name: string, extra: Partial<Wing> = {}): Wing {
    return {
        wing_id: name,
        pilot_id: 1,
        name,
        manufacturer: null,
        model: null,
        colour: '#3b82f6',
        flown_from: null,
        flown_until: null,
        retired: false,
        sort: 0,
        ...extra,
    } as unknown as Wing
}

const EPIC = wing('BGD Epic', { manufacturer: 'BGD', model: 'Epic' })
const ZENO = wing('Ozone Zeno 2', { manufacturer: 'Ozone', model: 'Zeno 2' })

describe('matchWingByName', () => {
    it('matches the whole name', () => {
        expect(matchWingByName('BGD Epic', [EPIC, ZENO])).toBe(EPIC)
    })

    it('folds case and spacing the way the wings table does', () => {
        expect(matchWingByName('ozone  zeno2', [EPIC, ZENO])).toBe(ZENO)
    })

    // The reported bug, in one line.
    it('matches the model with the manufacturer left off', () => {
        expect(matchWingByName('Epic', [EPIC, ZENO])).toBe(EPIC)
        expect(matchWingByName('epic', [EPIC, ZENO])).toBe(EPIC)
        expect(matchWingByName('Zeno 2', [EPIC, ZENO])).toBe(ZENO)
    })

    it('matches a trailing model on a name with no model column set', () => {
        const bare = wing('BGD Epic')
        expect(matchWingByName('Epic', [bare])).toBe(bare)
    })

    /**
     * "Rush" does not say which Rush. Two gliders answer to it and the honest
     * answer is that we do not know -- the caller publishes what the pilot
     * wrote and attributes nothing, which is better than attributing a year of
     * flying to the wrong wing.
     */
    it('refuses to guess between two wings that both answer to the name', () => {
        const five = wing('Ozone Rush 5', { model: 'Rush 5' })
        const six = wing('Ozone Rush 6', { model: 'Rush 6' })
        expect(matchWingByName('Rush', [five, six])).toBeNull()
    })

    it('does not match a manufacturer, or any other leading fragment', () => {
        expect(matchWingByName('Ozone', [ZENO])).toBeNull()
        expect(matchWingByName('BGD', [EPIC])).toBeNull()
    })

    it('does not match a fragment of a word', () => {
        // "pic" is inside "Epic" as text, and is not a wing anybody flies.
        expect(matchWingByName('pic', [EPIC])).toBeNull()
        // The reverse of the trailing-words rule: a pilot naming more than the
        // row does has not named that row.
        expect(matchWingByName('BGD Epic 2', [EPIC])).toBeNull()
    })

    it('is null for the ways a missing name arrives', () => {
        expect(matchWingByName(null, [EPIC])).toBeNull()
        expect(matchWingByName(undefined, [EPIC])).toBeNull()
        expect(matchWingByName('', [EPIC])).toBeNull()
        expect(matchWingByName('   ', [EPIC])).toBeNull()
    })

    it('is null for a pilot with no wings at all', () => {
        expect(matchWingByName('Epic', [])).toBeNull()
    })

    it('prefers the whole name over a trailing match on another wing', () => {
        // A pilot with both "Epic" and "BGD Epic" as rows means the one they
        // named exactly.
        const plain = wing('Epic')
        expect(matchWingByName('Epic', [EPIC, plain])).toBe(plain)
    })
})
