/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class Behavior extends Base {

    static getConstants () {
        return {
            BUILTIN: {
                sortOrder: './SortOrderBehavior'
            },
            CUSTOM_TYPE: 'custom'
        };
    }

    static getBuiltIn (name) {
        return this.BUILTIN.hasOwnProperty(name) ? require(this.BUILTIN[name]) : null;
    }

    static getDefaultConfig () {
        return null;
    }

    static prepareConfig (data) {
        return data;
    }

    static log (report, type, message, ...args) {
        report.log(type, `${this.name}: ${message}`, ...args);
    }

    static createModelBehaviors (model) {
        model.behaviors = [];
        for (const config of model.report.behaviors) {
            config.owner = model;
            model.behaviors.push(ClassHelper.spawn(config));
        }
    }

    static async execute (method, model) {
        model.ensureBehaviors();
        for (const behavior of model.behaviors) {
            if (behavior[method]) {
                await behavior[method]();
            }
        }
    }

    module = this.owner.module;

    get () {
        return this.owner.get(...arguments);
    }

    set () {
        return this.owner.set(...arguments);
    }

    getMeta () {
        return this.owner.getMeta();
    }

    async dropData () {
        // override if necessary
    }

    // beforeValidate
    // afterValidate

    // beforeInsert
    // afterInsert

    // beforeUpdate
    // afterUpdate

    // beforeDelete
    // afterDelete

    // beforeTransit
    // afterTransit

};
module.exports.init();

const ClassHelper = require('areto/helper/ClassHelper');