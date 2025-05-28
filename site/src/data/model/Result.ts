export type Result<V> = Success<V> | Failure
export type Success<V> = [V, undefined]
export type Failure = [undefined, string]

export function success<V>(value: V): Success<V> {
    return [value, undefined]
}

export function failure(message: string): Failure {
    return [undefined, message]
}