/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

// ["$out", "value"]
// ["$+", ".attr", 45, ...]
// ["$+", ".attr", ["$-", 67, ".attr"], 5]
// ["$length", ".towns"]
// ["$join", "separator", ".towns", ... ]
// ["$map", "toUpperCase", ".towns", ...]

const Base = require('areto/base/Base');

module.exports = class CalcToken extends Base {

    static getMethod (operator) {
        switch (operator) {
            case '$out': return this.prototype.resolveOut;
            case '$+': return this.prototype.resolveAddition;
            case '$-': return this.prototype.resolveSubtraction;
            case '$*': return this.prototype.resolveMultiplication;
            case '$/': return this.prototype.resolveDivision;
            case '$length': return this.prototype.resolveLength;
            case '$join': return this.prototype.resolveJoin;
            case '$map': return this.prototype.resolveMap;
        }
    }

    static mapOperand (operand, model) {
        if (operand instanceof Attr) {
            return model.get(operand.name);
        }
        if (operand instanceof CalcToken) {
            return operand.resolve(model);
        }
        return operand;
    }

    constructor (config) {
        super(config);
        this.method = this.constructor.getMethod(this.operator);
        this.operands = this.operands.map(this.initOperand.bind(this));
    }

    initOperand (data) {
        return this.calc.initOperand(data);
    }

    async resolve (model) {
        const values = [];
        for (const operand of this.operands) {
            values.push(await this.constructor.mapOperand(operand, model));
        }
        return this.method(...values);
    }

    resolveOut (value) {
        return value;
    }

    resolveAddition (...values) {
        let result = values[0];
        for (let i = 1; i < values.length; ++i) {
            result += values[i];
        }
        return result;
    }

    resolveSubtraction (...values) {
        let result = values[0];
        for (let i = 1; i < values.length; ++i) {
            result -= values[i];
        }
        return result;
    }

    resolveMultiplication (...values) {
        let result = values[0];
        for (let i = 1; i < values.length; ++i) {
            result *= values[i];
        }
        return result;
    }

    resolveDivision (...values) {
        let result = values[0];
        for (let i = 1; i < values.length; ++i) {
            result /= values[i];
        }
        return result;
    }

    resolveLength (value) {
        return value && value.length ? value.length : 0;
    }

    resolveJoin (separator, ...values) {
        return values.map(value => {
            return Array.isArray(value) ? value.join(separator) : value;
        }).join(separator);
    }

    resolveMap (methodName, ...values) {
        const method = this.executeMapMethod.bind(this, methodName);
        return [].concat(...values.map(value => Array.isArray(value) ? value.map(method) : value));
    }

    executeMapMethod (name, value) {
        return value && typeof value[name] === 'function' ? value[name]() : value;
    }

    log () {
        CommonHelper.log(this.calc, this.constructor.name, ...arguments);
    }
};

const CommonHelper = require('areto/helper/CommonHelper');
const Attr = require('../attr/Attr');