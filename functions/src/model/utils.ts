export function extractWing(description: String): string | null {
    const matches = description
        .split("\n")
        .map((line) => line.match(/^🪂 (.+?)(?:\s{2,}\d|\s+\d+ flights?|$)/))
        .filter(match => match != null)
        .map((match) => match!![1].trim())

    if (matches.length == 0) {
        return null
    }
    return matches[0]
}