/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class Calc extends Base {

    static create (key, attr) {
        if (attr.hasData(key)) {
            const data = this.data[key];
            return new this({attr, data});
        }
    }

    constructor (config) {
        super(config);
        this.token = this.createToken(this.data);
    }

    initOperand (data) {
        return this.createToken(data)
            || this.createRelation(data)
            || this.getAttr(data)
            || data;
    }

    getReport (name) {
        return this.attr.report.meta.getReport(name);
    }

    createToken (data) {
        if (Array.isArray(data)) {
            const TokenClass = this.getTokenClass(data[0]);
            const token = new TokenClass({
                calc: this,
                operator: data[0],
                operands: data.slice(1)
            });
            return token.method ? token : null;
        }
    }

    getTokenClass () {
        return CalcToken;
    }

    createRelation (data) {
        if (String(data).indexOf('.') === 0) {
            const relation = new CalcRelation({calc: this, data});
            return this.createToken(relation.queryData);
        }
    }

    getAttr (data) {
        if (typeof data === 'string') {
            if (data.indexOf('.') === 0) {
                return this.attr.report.getAttr(data.substring(1));
            }
        }
    }

    async resolve (models) {
        models = Array.isArray(models) ? models : [models];
        for (const model of models) {
            const value = this.token
                ? await this.token.resolve(model)
                : this.data;
            model.set(this.attr, value);
        }
    }

    log () {
        CommonHelper.log(this.attr, this.constructor.name, ...arguments);
    }
};

const CommonHelper = require('areto/helper/CommonHelper');
const CalcToken = require('./CalcToken');