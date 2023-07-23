/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class DataModel extends Base {

    static async delete (models) {
        for (const model of models) {
            await model.delete();
        }
    }

    _values = {};

    constructor (config) {
        super(config);
        this.header = new DataModelHeader({model: this});
    }

    getMeta () {
        return this.report.meta;
    }

    getId () {
        return this._values[this.report.getKey()];
    }

    getObjectId () {
        return this._values._id;
    }

    getMetaId () {
        return `${this.getId()}.${this.report.id}`;
    }

    getTitle () {
        return this.getId();
    }

    toString () {
        return this.getMetaId();
    }

    toJSON () {
        return this.getId();
    }

    // ATTR VALUES

    has (attr) {
        return Object.hasOwn(this._values, attr.name || attr);
    }

    get (attr) {
        attr = attr.name || attr;
        if (Object.hasOwn(this._values, attr)) {
            return this._values[attr];
        }
    }

    set (attr, value) {
        this._values[attr.name || attr] = value;
    }

    getValues () {
        return this._values;
    }

    getDisplayValue (attr) {
        attr = attr.name ? attr : this.report.getAttr(attr);
        if (attr) {
            const value = this.header.get(attr.name);
            if (value instanceof Date) {
                return value.toISOString();
            }
            if (typeof value === 'object') {
                return JSON.stringify(value);
            }
            return value;
        }
    }

    populate (data) {
        Object.assign(this._values, data);
    }

    // FIND

    findByModel (id) {
        return this.createQuery().and(['id', 'model', id]);
    }

    find () {
        return this.createQuery().and(...arguments);
    }

    createQuery () {
        return this.spawn(DataModelQuery, {report: this});
    }

    log () {
        CommonHelper.log(this.getMeta(), `${this.constructor.name}: ${this}`, ...arguments);
    }
};

const CommonHelper = require('areto/helper/CommonHelper');
const DataModelHeader = require('./DataModelHeader');
const DataModelQuery = require('./DataModelQuery');