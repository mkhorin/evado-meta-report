/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class Group extends Base {

    constructor (config) {
        super(config);
        this.init();
    }

    init () {
        this.name = this.data.name;
        this.actionBinder = this.data.actionBinder ? JSON.stringify(this.data.actionBinder) : '';
        this.options = this.data.options || {};
        this.type = this.data.type || 'set';
        this.title = MetaHelper.createTitle(this);
    }

    isGroup () {
        return true;
    }

    isActive () {
        return this.data.active;
    }

    getTitle () {
        return this.title;
    }

    prepare () {
        this.children = this.getAttrs().concat(this.getGroups());
        this.children.sort((a, b) => a.data.orderNumber - b.data.orderNumber);
    }

    getAttrs () {
        const list = [];
        for (const attr of this.report.attrs) {
            if (attr.data.group === this.name) {
                list.push(attr);
            }
        }
        return list;
    }

    getGroups () {
        const list = [];
        for (const group of Object.values(this.report.groups)) {
            if (group.data.parent === this.name) {
                list.push(group);
            }
        }
        return list;
    }
};

const MetaHelper = require('../helper/MetaHelper');