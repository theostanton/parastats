export type Result<V> = Success<V> | Failure
export type Success<V> = [V, undefined]
export type Failure = [undefined, string]