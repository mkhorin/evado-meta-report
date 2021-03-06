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
        if (!this._typeList) {
            this._typeList = Object.values(this.TYPES);
        }
        return this._typeList.includes(type);
    }

    static cast (value, type) {
        if (value === null || value === undefined) {
            return value;
        }
        if (Array.isArray(value)) {
            return value.map(item => this.cast(item, type));
        }
        switch (type) {
            case this.TYPES.STRING:
                return value.toString();

            case this.TYPES.ID:
                return value instanceof ObjectId ? value : ObjectId.isValid(value) ? ObjectId(value) : null;
            
            case this.TYPES.INTEGER:
                value = parseInt(value);
                return isNaN(value) ? null : value;

            case this.TYPES.FLOAT:
                value = parseFloat(value);
                return isNaN(value) ? null : value;

            case this.TYPES.DATE:
                if (!(value instanceof Date)) {
                    value = new Date(value);
                }
                return isNaN(value.getTime()) ? null : value;

            case this.TYPES.BOOLEAN:
                return !!value;
        }
        return value;
    }

    static getSearchCondition (value, type, attrName, db) {
        switch (type) {
            case this.TYPES.STRING:
                value = EscapeHelper.escapeRegex(value);
                return ['LIKE', attrName, new RegExp(value, 'i')];

            case this.TYPES.INTEGER:
            case this.TYPES.FLOAT:
                value = Number(value);
                return isNaN(value) ? null : {[attrName]: value};

            case TypeHelper.TYPES.ID:
                value = db.normalizeId(value);
                return value ? {[attrName]: value} : null;

            case TypeHelper.TYPES.DATE:
                value = DateHelper.getDayInterval(value);
                return value ? ['AND', ['>=', attrName, value[0]], ['<', attrName, value[1]]] : null;
        }
    }
};
module.exports.init();

const DateHelper = require('areto/helper/DateHelper');
const EscapeHelper = require('areto/helper/EscapeHelper');
const ObjectId = require('mongodb').ObjectID;