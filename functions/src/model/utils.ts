export function extractWing(description: String): string | null {
    const matches = description
        .split("\n")
        .map((line) => line.match(/^🪂 ([a-zA-Z ]*)/g))
        .filter(match => match != null && match.length > 0)
        .map((line) => line!![0].replace("🪂 ", ""))

    if (matches.length == 0) {
        return null
    }
    return matches[0]
}