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
        if (Number.isSafeInteger(value)) {
            value += this.step;
        } else {
            value = this.start;
        }
        this.owner.set(this.attrName, value);
    }

    getExtremeValue () {
        return this.owner.report.createQuery().order({
            [this.attrName]: this.step > 0 ? -1 : 1
        }).scalar(this.attrName);
    }

    async update (data, cls) {
        for (const id of Object.keys(data)) {
            const model = await cls.findById(id).one();
            if (model) {
                model.setUser(this.user);
                model.set(this.attrName, data[id]);
                await model.forceSave();
            }
        }
    }
};