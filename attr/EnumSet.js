/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class EnumSet extends Base {

    constructor (config) {
        super(config);
        this._report = this.owner.attr.report.meta.getReport(this.data.report);
        this._valueAttr = this._report
            ? this._report.getAttr(this.data.valueAttr)
            : null;
        this._resolvedItems = this.data.items;
        this.indexItems();
    }

    indexItems () {
        this._indexedItems = {};
        if (Array.isArray(this.data.items)) {
            for (const item of this.data.items) {
                if (!(item.hasOwnProperty('text'))) {
                    item.text = item.value;
                }
                this._indexedItems[item.value] = item;
            }
        }
    }

    getData () {
        return {
            condition: this.data.activation,
            items: this._resolvedItems
        };
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

    async resolve () {
        if (this._report) {
            // select all unique values by class attr
            const query = this._report.find().and(this.data.objectFilter);
            const key = this._valueAttr
                ? this._valueAttr.name
                : this._report.getKey();
            const values = await query.distinct(key);
            this._resolvedItems = values.map(value => ({
                value,
                text: this.getText(value)
            }));
        }
    }
};