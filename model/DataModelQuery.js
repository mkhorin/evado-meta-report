/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/db/Query');

module.exports = class DataModelQuery extends Base {

    constructor (config) {
        super(config);
        this._db = this.report.getDb();
        this._from = this.report.table;
        this._order = this.report.order;
        this._raw = null;
    }

    byOwner (id) {
        return this.and(['id', this.report.OWNER_ATTR, id]);
    }

    getMeta () {
        return this.report.meta;
    }

    raw (value = true) {
        this._raw = value;
        return this;
    }

    setCustomOrder (value) {
        this._customOrder = value;
        return this;
    }

    withListData (value = true) {
        this._withAttrTitle = value;
        this._withCalc = value;
        return this;
    }

    withAttrTitle (value = true) {
        this._withAttrTitle = value;
        return this;
    }

    withTitle (value = true) {
        this._withTitle = value;
        return this;
    }

    withCalc (value = true) {
        this._withCalc = value;
        return this;
    }

    copyParams (query) {
        this._withCalc = query._withCalc;
        this._withTitle = query._withTitle;
        this._withAttrTitle = query._withAttrTitle;
        return this;
    }

    // POPULATE

    async populate (docs) {
        if (docs.length === 0) {
            return docs;
        }
        if (this._customOrder) {
            MetaHelper.sortDocsByMap(docs, this._customOrder, this.report.getKey());
        }
        if (this._raw) {
            return super.populate(docs);
        }
        const models = [];
        const params = this.module ? {module: this.module} : null;
        for (const doc of docs) {
            const model = this.report.createDataModel(params);
            model.populate(doc);
            models.push(model);
        }
        if (this._withCalc) {
            if (this.report.calcAttrs.length) {
                await this.resolveCalc(models);
            }
        }
        if (this._withAttrTitle) {
            await this.resolveAttrTitle(models);
        }
        if (this._withTitle) {
            await this.resolveTitle(models);
        }
        if (this.report.userAttrs.length) {
            await this.resolveUsers(models);
        }
        return this._index
            ? this.indexModels(models)
            : models;
    }

    async resolveCalc (models) {
        for (const attr of this.report.calcAttrs) {
            await attr.calc.resolve(models);
        }
    }

    async resolveAttrTitle (models) {
        for (const attr of this.report.headerAttrs) {
            await attr.header.resolve(models);
        }
    }

    resolveTitle (models) {
        if (this.report.header) {
            return this.report.header.resolve(models);
        }
    }

    async resolveUsers (models) {
        const ids = MetaHelper.getModelsValues(models, this.report.userAttrs);
        if (ids.length) {
            const user = this.getMeta().spawnUser();
            const users = await user.findById(ids).indexByKey().all();
            MetaHelper.setModelValueFromIndexedData(users, models, this.report.userAttrs);
        }
    }

    indexModels (models) {
        const result = {};
        for (const model of models) {
            result[model.get(this._index)] = model;
        }
        return result;
    }

    // PREPARE

    async prepare () {
        if (this.prepared) {
            return;
        }
        if (Array.isArray(this._afterPrepareHandlers)) {
            for (const handler of this._afterPrepareHandlers) {
                await handler(this);
            }
        }
        this.prepared = true;
    }

    addAfterPrepare (handler) {
        ObjectHelper.push(handler, '_afterPrepareHandlers', this);
        return this;
    }
};

const ObjectHelper = require('areto/helper/ObjectHelper');
const MetaHelper = require('../helper/MetaHelper');