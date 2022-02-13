/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class DataModelHeader extends Base {

    data = {};
    value = null;

    get (name) {
        return Object.prototype.hasOwnProperty.call(this.data, name)
            ? this.data[name]
            : this.model.get(name);
    }

    toString () {
        return this.value || this.model.getId();
    }
};