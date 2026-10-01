// =======================================
//  Rules
// =======================================

class IsRequired {
    isValid(value) {
        return value !== null &&
            value !== undefined &&
            value !== ''
    }
}

class IsContained {
    constructor(substring) {
        this.substring = substring
    }

    isValid(value) {
        return value.includes(this.substring)
    }
}

class IsMinLength {
    constructor(minLength) {
        this.minLength = minLength
    }

    isValid(value) {
        return value.length >= this.minLength
    }
}

class IsPositive {
    isValid(value) {
        return value > 0
    }
}

class IsInRange {
    constructor(from, to) {
        this.from = from
        this.to = to
    }

    isValid(value) {
        return value >= this.from && value <= this.to
    }
}

class IsSizeof {
    constructor(size) {
        this.size = size
    }

    isValid(value) {
        return value.length === this.size
    }
}


// =======================================
//  Base validator
// =======================================

class BaseValidator {
    constructor(customValidators) {
        this.rules = {}
        this.customValidators = customValidators
    }

    required() {
        this.rules.required = new IsRequired()
        return this
    }

    test(name, ...args) {
        this.rules[name] = {
            isValid: (value) => this.customValidators[name](value, ...args)
        }
        return this
    }

    isValid(value) {

        if (value === null || value === undefined) {
            return !this.rules.required
        }

        if (!this.isTypeValid(value)) {
            return false
        }

        for (const key of Object.keys(this.rules)) {
            if (!this.rules[key].isValid(value)) {
                return false
            }
        }

        return true
    }
}

// =======================================
//  String validator
// =======================================

class StringValidator extends BaseValidator {

    isTypeValid(value) {
        return typeof value === 'string'
    }

    contains(parameter) {
        this.rules.contains = new IsContained(parameter)
        return this
    }

    minLength(parameter) {
        this.rules.minLength = new IsMinLength(parameter)
        return this
    }

}


// =======================================
//  Number validator
// =======================================


class NumberValidator extends BaseValidator {

    isTypeValid(value) {
        return typeof value === 'number'
    }

    positive() {
        this.rules.positive = new IsPositive()
        return this
    }

    range(from, to) {
        this.rules.minLength = new IsInRange(from, to)
        return this
    }

}


// =======================================
//  Array validator
// =======================================

class ArrayValidator extends BaseValidator {

    isTypeValid(value) {
        return Array.isArray(value)
    }

    sizeof(size) {
        this.rules.sizeof = new IsSizeof(size)
        return this
    }

}


// =======================================
//  Object validator
// =======================================

class ObjectValidator {
    constructor() {
        this.rules = {}
    }

    shape(newRules) {
        this.rules = { ...this.rules, ...newRules }
    }

    isValid(data) {

        for (const key of Object.keys(this.rules)) {
            const value = data[key]

            if (!this.rules[key].isValid(value)) {
                return false
            }
        }
        return true
    }

}



// =======================================
//  Validator
// =======================================

class Validator {

    customValidators = {
        string: {},
        number: {},
        array: {},
        object: {}
    }

    string() {
        return new StringValidator(this.customValidators.string)
    }

    number() {
        return new NumberValidator(this.customValidators.number)
    }

    array() {
        return new ArrayValidator(this.customValidators.array)
    }

    object() {
        return new ObjectValidator(this.customValidators.object)
    }

    addValidator(validator, name, fn) {

        const currentValidator = this.customValidators[validator]

        if (!currentValidator) {
            throw new Error(`Unknown validator: ${validator}`)
        }

        currentValidator[name] = fn

    }

}


export default Validator
