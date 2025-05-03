export interface Result<Value>{

}

export class Success<Value> implements Result<Value> {
    readonly value: Value

    constructor(value: Value) {
        this.value = value
    }
}

export class Failed<Value> implements Result<Value> {
    readonly error: string

    constructor(error: string) {
        this.error = error
    }
}

