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
        const direction = this.step > 0 ? -1 : 1;
        const query = this.owner.report.createQuery();
        query.order({[this.attrName]: direction});
        return query.scalar(this.attrName);
    }

    async update (data, report) {
        const config = {
            module: this.module,
            user: this.user
        };
        for (const id of Object.keys(data)) {
            const query = report.createQuery(config).byId(id);
            const model = await query.one();
            if (model) {
                model.set(this.attrName, data[id]);
                await model.forceSave();
            }
        }
    }
};