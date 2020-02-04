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
        this.initData();
    }

    initData () {
        this.title = MetaHelper.createTitle(this);
        this.description = this.data.description || '';
        this.options = this.data.options || {};
        if (!this.options.format) {
            this.options.format = this.getDefaultFormat();
        }
        this.searchDepth = this.resolveSearchDepth();
    }

    isCalc () {
        return this.type === TypeHelper.TYPES.CALC;
    }

    isDate () {
        return this.type === TypeHelper.TYPES.DATE;
    }

    isGroup () {
        return false;
    }

    isHidden () {
        return this.data.hidden === true;
    }

    isNumber () {
        return this.type === TypeHelper.TYPES.INTEGER || this.type === TypeHelper.TYPES.FLOAT;
    }

    isString () {
        return this.type === TypeHelper.TYPES.STRING;
    }

    isUTC () {
        return this.viewType === TypeHelper.VIEW_TYPES.DATE
            || this.viewType === TypeHelper.VIEW_TYPES.DATETIME;
    }

    isUser () {
        return this.type === TypeHelper.TYPES.USER;
    }

    isSearchable () {
        return !this.isCalc();
    }

    isSortable () {
        return this.data.sortable === true;
    }

    hasData (key) {
        return Object.prototype.hasOwnProperty.call(this.data, key);
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
        return NestedValueHelper.get(key, this.options, defaults);
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

    createCalc () {
        if (this.hasData('expression')) {
            this.calc = new Calc({
                attr: this,
                data: this.data.expression
            });
        }
    }

    createDefaultValue () {
        if (this.hasData('defaultValue')) {
            this.defaultValue = new Calc({
                attr: this,
                data: this.data.defaultValue
            });
        }
    }

    prepare () {
        this.enum = Enum.create(this) ;
        this.prepareBehaviors();
    }

    prepareBehaviors () {
        if (Array.isArray(this.data.behaviors)) {
            for (const data of this.data.behaviors) {
                this.report.addAttrBehavior(this, data);
            }
        }
    }

    resolveSearchDepth () {
        return MetaHelper.resolveInteger(this.data.searchDepth, this.DEFAULT_SEARCH_DEPTH, this.MAX_SEARCH_DEPTH);
    }

    // SEARCH

    getSearchCondition (value) {
        const condition = TypeHelper.getSearchCondition(value, this.getType(), this.name, this.report.getDb());
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
const NestedValueHelper = require('areto/helper/NestedValueHelper');
const MetaHelper = require('../helper/MetaHelper');
const Enum = require('./Enum');
const Calc = require('../calc/Calc');
const TypeHelper = require('../helper/TypeHelper');