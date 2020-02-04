/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('./BaseSource');

module.exports = class DatabaseSource extends Base {

    constructor (config) {
        super({
            tables: {
                report: 'meta_report'
            },
            ...config
        });
        this.db = this.meta.getDb();
    }

    async load () {
        this.clear();
        for (const key of Object.keys(this.tables)) {
            this._data[key] = await this.db.find(this.tables[key]);
        }      
        return this._data;
    }

    insert (table, data) {
        return this.db.insert(this.tables[table], data);
    }

    async delete () {
        await this.db.delete(this.tables.report);
    }

    async deleteReport (name) {
        await this.db.delete(this.tables.report, {name});
    }

    async dropTables () {
        for (const table of Object.values(this.tables)) {
            await this.db.drop(table);
        }
    }
};