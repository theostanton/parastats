import { Wing } from './model';

/**
 * Matching the wing a pilot named on their Strava description against the wings
 * they have rows for.
 *
 * Shared, because both import paths need it and both had their own copy: an
 * exact fold of the whole name, and nothing else. That is stricter than what
 * pilots actually type. The catalogue stores gliders as manufacturer and model
 * together -- "BGD Epic" -- and the pilot writing the description writes the
 * model alone, because that is what they call it. `🪂 Epic` matched nothing,
 * fell through to the date-range resolver, and the flight came out
 * unattributed.
 *
 * Nothing here invents an attribution. Every tier below either finds exactly
 * one wing or gives up: two gliders that both plausibly answer to what the
 * pilot wrote is a case where we do not know, and the caller has a better
 * answer for that than a coin toss.
 */

/**
 * Identity as the wings table folds it: pilots type "Zeno 2", "zeno2" and
 * "Zeno  2" for one glider.
 */
function key(value: string): string {
    return value.toLowerCase().replace(/\s+/g, '')
}

function words(value: string): string[] {
    return value.trim().toLowerCase().split(/\s+/).filter(Boolean)
}

/**
 * Whether `name` ends with `named` word for word: "BGD Epic" ends with "Epic".
 *
 * Word-wise rather than as a substring of the folded text, which is what keeps
 * "Rush" away from "Ozone Rush 6" -- a pilot writing "Rush" has not said which
 * Rush, and the tier returns nothing rather than guessing between the 5 and
 * the 6. The trailing end is the one that carries the model, so this matches a
 * name with its manufacturer left off and not the reverse.
 */
function endsWithWords(name: string, named: string): boolean {
    const nameWords = words(name)
    const namedWords = words(named)
    if (namedWords.length === 0 || namedWords.length > nameWords.length) {
        return false
    }
    const offset = nameWords.length - namedWords.length
    return namedWords.every((word, index) => word === nameWords[offset + index])
}

/** The single wing matching a tier, or null when none or more than one does. */
function only(candidates: Wing[]): Wing | null {
    return candidates.length === 1 ? candidates[0] : null
}

/**
 * The wing a pilot meant by the name they wrote, if it is one of theirs.
 *
 * Tried in descending order of how sure it makes us: the whole name, then the
 * model column, then the name with a manufacturer left off the front. Null
 * means the name is not one we have a row for -- which is ordinary, and not the
 * same as the flight having no wing. See how the callers use it: the name the
 * pilot wrote is still published, it simply carries no `wing_id`.
 */
export function matchWingByName(named: string | null | undefined, wings: Wing[]): Wing | null {
    if (!named || named.trim().length === 0) {
        return null
    }
    const wanted = key(named)

    const byName = wings.filter(wing => key(wing.name) === wanted)
    if (byName.length > 0) {
        // Unique per pilot in the schema, so there is never more than one.
        return byName[0]
    }

    const byModel = only(wings.filter(wing => wing.model != null && key(wing.model) === wanted))
    if (byModel) {
        return byModel
    }

    return only(wings.filter(wing => endsWithWords(wing.name, named)))
}
