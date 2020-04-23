/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('./Group');

module.exports = class Grouping extends Base {

    init () {}

    forceGetAttrs () {
        const list = [];
        for (const attr of this.report.attrs) {
            if (!attr.data.group || !this.getGroup(attr.data.group)) {
                list.push(attr);
            }
        }
        return list;
    }

    forceGetGroups () {
        const list = [];
        for (const group of Object.values(this.report.grouping.groupMap)) {
            if (!this.getGroup(group.data.parent)) {
                list.push(group);
            }
        }
        return list;
    }
};