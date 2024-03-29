/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class TypeHelper extends Base {

    static getConstants () {
        return {
            TYPES: {
                BOOLEAN: 'boolean',
                CALC: 'calc',
                DATE: 'date',
                FLOAT: 'float',
                ID: 'id',
                INTEGER: 'integer',
                STRING: 'string'
            },
            VIEW_TYPES: {
                DATE: 'date',
                DATETIME: 'datetime',
                TIMESTAMP: 'timestamp'
            }
        };
    }

    static hasType (type) {
        return Object.values(this.TYPES).includes(type);
    }

    static cast (value, type) {
        if (value === null || value === undefined) {
            return value;
        }
        if (Array.isArray(value)) {
            return value.map(item => this.cast(item, type));
        }
        switch (type) {
            case this.TYPES.STRING: {
                return value.toString();
            }
            case this.TYPES.ID: {
                if (value instanceof ObjectId) {
                    return value;
                }
                return ObjectId.isValid(value)
                    ? new ObjectId(value)
                    : null;
            }
            case this.TYPES.INTEGER: {
                value = parseInt(value);
                return isNaN(value) ? null : value;
            }
            case this.TYPES.FLOAT: {
                value = parseFloat(value);
                return isNaN(value) ? null : value;
            }
            case this.TYPES.DATE: {
                if (!(value instanceof Date)) {
                    value = new Date(value);
                }
                return isNaN(value.getTime()) ? null : value;
            }
            case this.TYPES.BOOLEAN: {
                return !!value;
            }
        }
        return value;
    }

    static getSearchCondition (value, type, attrName, db) {
        switch (type) {
            case this.TYPES.STRING: {
                value = EscapeHelper.escapeRegex(value);
                return ['like', attrName, new RegExp(value, 'i')];
            }
            case this.TYPES.INTEGER:
            case this.TYPES.FLOAT: {
                value = Number(value);
                return isNaN(value) ? null : {[attrName]: value};
            }
            case TypeHelper.TYPES.ID: {
                value = db.normalizeId(value);
                return value ? {[attrName]: value} : null;
            }
            case TypeHelper.TYPES.DATE: {
                value = DateHelper.getDayInterval(value);
                return value
                    ? ['and', ['>=', attrName, value[0]], ['<', attrName, value[1]]]
                    : null;
            }
        }
    }
};
module.exports.init();

const {ObjectId} = require('mongodb');
const DateHelper = require('areto/helper/DateHelper');
const EscapeHelper = require('areto/helper/EscapeHelper');