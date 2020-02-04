/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('./Header');

module.exports = class AttrHeader extends Base {

    constructor (config) {
        super(config);
        const regex = new RegExp('\{\\$self', 'g');
        this.owner.data.header = this.owner.data.header.replace(regex, `{${this.owner.name}`);
        this.parse(this.owner.data.header, AttrToken);
    }

    assignResult (model, result) {
        model.header.data[this.owner.name] = result;
    }
};

const AttrToken = require('./AttrToken');