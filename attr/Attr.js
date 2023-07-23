/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class Attr extends Base {

    static getConstants () {
        return {
            STOP_INHERIT: [
                'behaviors',
                'enums'
            ],
            DEFAULT_SEARCH_DEPTH: 1,
            MAX_SEARCH_DEPTH: 10
        };
    }

    constructor (config) {
        super(config);
        this.init();
    }

    init () {
        this.name = this.data.name;
        this.type = this.data.type;
        this.viewType = this.data.viewType || this.type;
        this.id = `${this.name}.${this.report.id}`;
        this.templateKey = `_attr/${this.report.name}/${this.name}`;
        this.parentTemplateKey = this.templateKey;
        this.title = MetaHelper.createLabel(this);
        this.description = this.data.description || '';
        this.options = this.data.options || {};
        if (!this.options.format) {
            this.options.format = this.getDefaultFormat();
        }
        this.searchDepth = this.resolveSearchDepth();
        this.template = this.options.template || this.viewType;
    }

    isCalc () {
        return this.type === TYPES.CALC;
    }

    isDate () {
        return this.type === TYPES.DATE;
    }

    isGroup () {
        return false;
    }

    isHidden () {
        return this.data.hidden === true;
    }

    isNumber () {
        return this.type === TYPES.INTEGER || this.type === TYPES.FLOAT;
    }

    isString () {
        return this.type === TYPES.STRING;
    }

    isText () {
        return this.type === TYPES.TEXT;
    }

    isUTC () {
        return this.viewType === VIEW_TYPES.DATE
            || this.viewType === VIEW_TYPES.DATETIME;
    }

    isUser () {
        return this.type === TYPES.USER;
    }

    isSearchable () {
        return !this.isCalc();
    }

    isSortable () {
        return this.data.sortable === true;
    }

    hasData (key) {
        return Object.hasOwn(this.data, key);
    }

    getId() {
        return this.id;
    }

    getMeta () {
        return this.report.meta;
    }

    getName () {
        return this.name;
    }

    getTemplate () {
        return this.template;
    }

    getTitle () {
        return this.title;
    }

    getType () {
        return this.type;
    }

    getViewType () {
        return this.viewType;
    }

    getOption (key, defaults) {
        return NestedHelper.get(key, this.options, defaults);
    }

    getFormat () {
        return this.options.format;
    }

    getDefaultFormat () {
        switch (this.viewType) {
            case 'date': return 'L';
            case 'datetime': return 'L LTS';
            case 'timestamp': return 'L LTS';
        }
    }

    toString () {
        return this.id;
    }

    prepare () {
        this.createEnum();
        this.createCalc();
        this.createDefaultValue();
    }

    createEnum () {
        this.enum = Enum.create(this);
    }

    createCalc () {
        this.calc = Calc.create('expression', this);
    }

    createDefaultValue () {
        this.defaultValue = Calc.create('defaultValue', this);
    }

    resolveSearchDepth () {
        return MetaHelper.resolveInteger(this.data.searchDepth, this.DEFAULT_SEARCH_DEPTH, this.MAX_SEARCH_DEPTH);
    }

    // SEARCH

    getSearchCondition (value) {
        const type = this.getType();
        const db = this.report.getDb();
        const condition = TypeHelper.getSearchCondition(value, type, this.name, db);
        if (condition === undefined) {
            this.log('error', 'Invalid search condition');
        }
        return condition;
    }

    // LOG

    log () {
        CommonHelper.log(this.getMeta(), `${this.constructor.name}: ${this.id}`, ...arguments);
    }
};
module.exports.init();

const CommonHelper = require('areto/helper/CommonHelper');
const NestedHelper = require('areto/helper/NestedHelper');
const MetaHelper = require('../helper/MetaHelper');
const Enum = require('./Enum');
const Calc = require('../calc/Calc');
const TypeHelper = require('../helper/TypeHelper');
const {VIEW_TYPES, TYPES} = TypeHelper;