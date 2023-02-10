/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class ReportIndexes extends Base {

    getDb () {
        return this.report.getDb();
    }

    getTable () {
        return this.report.table;
    }

    async update () {
        await this.drop();
        await this.create();
    }

    async drop () {
        await this.getDb().dropIndexes(this.getTable());
        this.log('info', 'Indexes dropped');
    }

    async create () {
        const items = this.getIndexList();
        for (const data of items) {
            await this.getDb().createIndex(this.getTable(), data);
        }
        this.log('info', 'Indexes created');
    }

    getIndexList () {
        let indexes = [];
        if (this.report.data.indexes) {
            indexes = indexes.concat(this.report.data.indexes);
        }
        for (const attr of this.report.attrs) {
            const index = this.getAttrIndex(attr);
            if (index) {
                indexes.push(index);
            }
        }
        indexes.push([{[this.report.OWNER_ATTR]: 1}]);
        return indexes;
    }

    getAttrIndex (attr) {
        if (!attr.data.indexing) {
            return null;
        }
        return [{[attr.name]: attr.data.indexing}];
    }

    log () {
        CommonHelper.log(this.report, this.constructor.name, ...arguments);
    }
};

const CommonHelper = require('areto/helper/CommonHelper');