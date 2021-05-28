/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class Enum extends Base {

    static create (attr) {
        const data = attr.data.enums;
        if (Array.isArray(data) && data.length) {
            return new this({attr, data});
        }
    }

    constructor (config) {
        super(config);
        this.createSets();
        this.indexItems();
    }

    createSets () {
        this.sets = [];
        for (const data of this.data) {
            this.sets.push(new EnumSet({owner: this, data}));
        }
    }

    indexItems () {
        this._indexedItems = {};
        for (const item of this.sets) {
            Object.assign(this._indexedItems, item._indexedItems);
        }
    }

    getSets () {
        const result = [];
        for (const item of this.sets) {
            result.push(item.getData());
        }
        return result;
    }

    hasItem (value) {
        return Object.prototype.hasOwnProperty.call(this._indexedItems, value);
    }

    getItem (value) {
        return this.hasItem(value) ? this._indexedItems[value] : null;
    }

    getText (value) {
        return this.hasItem(value) ? this._indexedItems[value].text : value;
    }
};

const EnumSet = require('./EnumSet');