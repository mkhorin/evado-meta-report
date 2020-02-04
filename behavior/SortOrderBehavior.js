/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('./Behavior');

module.exports = class SortOrderBehavior extends Base {

    constructor (config) {
        super({
            start: 10,
            step: 10,
            ...config
        });
    }

    async beforeInsert () {
        let value = await this.getExtremeValue();
        if (Number.isInteger(value)) {
            value += this.step;
        } else {
            value = this.start;
        }
        this.owner.set(this.attrName, value);
    }

    getExtremeValue () {
        return this.owner.report.find().order({
            [this.attrName]: this.step > 0 ? -1 : 1
        }).scalar(this.attrName);
    }

    async update (data, metaClass) {
        for (const id of Object.keys(data)) {
            const model = await metaClass.findById(id).one();
            if (model) {
                model.setUser(this.user);
                model.set(this.attrName, data[id]);
                await model.forceSave();
            }
        }
    }
};