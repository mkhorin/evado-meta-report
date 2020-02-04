/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('./Header');

module.exports = class ClassHeader extends Base {

    constructor (config) {
        super(config);        
        this.parse(this.owner.data.header, ClassToken);
    }

    assignResult (model, result) {
        model.header.value = result;
    }
};

const ClassToken = require('./ClassToken');