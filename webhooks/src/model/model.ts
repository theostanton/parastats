export function success<T>(value: T): Success<T> {
    return new Success(value)
}

export function failed(message: string): Failed {
    return new Failed(message)
}

export function isFailed<T>(result: Result<T>): result is Failed {
    return !result.success
}

export type Result<T> = Success<T> | Failed

export class Success<Value> {
    readonly success: true = true
    readonly value: Value

    constructor(value: Value) {
        this.value = value
    }
}

export class Failed {
    readonly success: false = false
    readonly error: string

    constructor(error: string) {
        this.error = error
    }
}

