/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('./Group');

module.exports = class RootGroup extends Base {

    init () {}

    getAttrs () {
        const list = [];
        for (const attr of this.report.attrs) {
            if (!attr.data.group || !this.report.hasGroup(attr.data.group)) {
                list.push(attr);
            }
        }
        return list;
    }

    getGroups () {
        const list = [];
        for (const group of Object.values(this.report.groups)) {
            if (!this.report.hasGroup(group.data.parent)) {
                list.push(group);
            }
        }
        return list;
    }
};