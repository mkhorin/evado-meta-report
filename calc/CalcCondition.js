/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class CalcCondition extends Base {

    constructor (config) {
        super(config);
        this.initData();
    }

    initData () {
        if (Array.isArray(this.data)) {
            this.initArrayData();
        }
        if (this.data && typeof this.data === 'object') {
             this.initHashData();
        }
    }

    initArrayData () {
        this.method = this.constructor.prototype.resolveSimple;
        this.operator = this.data[0];
        this.operands = this.data.slice(1).map(this.initOperand.bind(this));
    }

    /**
     * Hash condition: {a1: 1, a2: [1, 2]}
     */
    initHashData () {
        this.method = this.constructor.prototype.resolveHash;
        for (const key of Object.keys(this.data)) {
            this.data[key] = this.initOperand(this.data[key]);
        }
    }

    initOperand (data) {
        return this.token.initOperand(data);
    }

    resolve (model) {
        return this.method?.call(this, model);
    }

    async resolveSimple (model) {
        const values = [];
        if (Array.isArray(this.operands)) {
            for (const operand of this.operands) {
                values.push(await this.token.constructor.mapOperand(operand, model));
            }
        }
        values.unshift(this.operator);
        return values;
    }

    async resolveHash (model) {
        const result = {};
        if (this.data) {
            for (const key of Object.keys(this.data)) {
                result[key] = await this.token.constructor.mapOperand(this.data[key], model);
            }
        }
        return result;
    }
};