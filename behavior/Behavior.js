/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class Behavior extends Base {

    static getConstants () {
        return {
            BUILTIN: {
                'sortOrder': './SortOrderBehavior'
            },
            CUSTOM_BEHAVIOR_TYPE: 'custom'
        };
    }

    static createConfigurations (owner) {
        const items = owner.data.behaviors;
        if (!Array.isArray(items)) {
            return null;
        }
        owner.behaviors = [];
        for (const item of items) {
            const data = this.createConfiguration(item, owner);
            data ? this.appendConfiguration(owner, data)
                 : owner.log('error', 'Invalid behavior configuration', item);
        }
    }

    static initConfiguration () {
        // override if necessary
    }

    static appendConfiguration (owner, data) {
        data.Class.initConfiguration(data);
        ObjectHelper.push(data, 'behaviors', owner);
        return data;
    }

    static createConfiguration (data, owner) {
        if (!data) {
            return null;
        }
        if (this.BUILTIN.hasOwnProperty(data)) {
            return {Class: require(this.BUILTIN[data])};
        }
        if (data.type === this.CUSTOM_BEHAVIOR_TYPE) {
            return ClassHelper.resolveSpawn(data.config, owner.getMeta().module);
        }
        if (this.BUILTIN.hasOwnProperty(data.type)) {
            return {...data, Class: require(this.BUILTIN[data.type])};
        }
    }

    static createModelBehaviors (model) {
        model.behaviors = [];
        if (model.report.behaviors) {
            for (const config of model.report.behaviors) {
                config.owner = model;
                model.behaviors.push(ClassHelper.spawn(config));
            }
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

    getMeta () {
        return this.owner.getMeta();
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