/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class Report extends Base {

    static getConstants () {
        return {
            OWNER_ATTR: '_owner'
        };
    }

    constructor (config) {
        super(config);
        this.name = this.data.name;
        this.id = this.name;
        this.table = `${this.meta.dataTablePrefix}${this.name}`;
        this.key = '_id';
        this.indexes = this.createIndexes();
    }

    getDb () {
        return this.meta.getDb();
    }

    getMeta () {
        return this.meta;
    }

    getName () {
        return this.name;
    }

    getLabel () {
        return this.data.label || this.name;
    }
    
    getTitle () {
        return this.id;
    }

    getKey () {
        return this.key;
    }

    hasKeyAttr () {
        return this.hasAttr(this.key);
    }

    getOrder () {
        return this.data.order;
    }

    hasAttr (name) {
        return this.attrMap[name] instanceof Attr;
    }

    getAttr (name) {
        return this.hasAttr(name) ? this.attrMap[name] : null;
    }

    getAttrs () {
        return this.attrs;
    }

    toString () {
        return this.id;
    }

    createBehaviors () {
        this.behaviors = new ReportBehaviors({owner: this});
        this.behaviors.init();
    }

    createMinerConfig () {
        try {
            this.minerConfig = ClassHelper.resolveSpawn(this.data.minerConfig, this.meta.module);
        } catch {
            this.log('error', 'Invalid miner configuration:', this.data.minerConfig);
        }
    }

    createMiner (params) {
        return ClassHelper.spawn(this.minerConfig, params);
    }

    createDataModel (params) {
        return new DataModel({report: this, ...params});
    }

    createIndexes () {
        return new ReportIndexes({report: this});
    }

    createQuery (config) {
        return new DataModelQuery({report: this, ...config});
    }

    find () {
        return this.createQuery().and(...arguments);
    }

    findByOwner (id) {
        return this.createQuery().byOwner(id);
    }

    insert (values) {        
        return this.getDb().insert(this.table, values);
    }

    async dropData () {
        await this.getDb().drop(this.table);
        await this.behaviors.dropData();
        this.log('info', 'Data deleted');
    }

    createAttrs () {
        this.data.attrs = this.data.attrs || [];
        MetaHelper.sortByOrderNumber(this.data.attrs);
        this.attrMap = {};
        this.attrs = [];
        this.userAttrs = [];
        this.calcAttrs = [];
        this.searchAttrs = [];
        this.commonSearchAttrs = []; // search attributes for common grid search
        this.selectSearchAttrs = []; // search attributes for select2 requests
        for (const data of this.data.attrs) {
            this.appendAttr(this.createAttr(data));
        }
    }

    createAttr (data) {
        return this.createAttrInternal(data, {
            Class: Attr,
            report: this
        });
    }

    createAttrInternal (data, config) {
        if (!data) {
            return this.log('error', 'Invalid attribute data');
        }
        if (this.hasAttr(data.name)) {
            return this.log('error', `Attribute already exists: ${data.name}`);
        }
        config.data = data;
        return this.attrMap[data.name] = this.spawn(config);
    }

    appendAttr (attr) {
        if (!attr) {
            return false;
        }
        this.attrs.push(attr);
        if (attr.isUser()) {
            this.userAttrs.push(attr);
        }
        if (attr.isCalc()) {
            this.calcAttrs.push(attr);
        }
        if (attr.isSearchable()) {
            this.searchAttrs.push(attr);
        }
        if (attr.data.commonSearchable) {
            this.commonSearchAttrs.push(attr);
        }
        if (attr.data.selectSearchable) {
            this.selectSearchAttrs.push(attr);
        }
    }

    createAttrHeader () {
        this.headerAttrs = [];
        for (const attr of this.attrs) {
            if (attr.data.header) {
                attr.header = new AttrHeader({owner: attr});
            } else if (attr.enum) {
                attr.data.header = '{$self::enum}';
                attr.header = new AttrTitle({owner: attr});
            }
            if (attr.header) {
                this.headerAttrs.push(attr);
            }
        }
    }

    prepareAttrs () {
        this.attrs.forEach(attr => attr.prepare());
    }

    log () {
        CommonHelper.log(this.meta, `${this.constructor.name}: ${this.id}`, ...arguments);
    }    
};
module.exports.init();

const ClassHelper = require('areto/helper/ClassHelper');
const CommonHelper = require('areto/helper/CommonHelper');
const MetaHelper = require('../helper/MetaHelper');
const Attr = require('../attr/Attr');
const AttrHeader = require('../header/AttrHeader');
const DataModel = require('../model/DataModel');
const DataModelQuery = require('../model/DataModelQuery');
const ReportBehaviors = require('./ReportBehaviors');
const ReportIndexes = require('./ReportIndexes');