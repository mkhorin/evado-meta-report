/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('evado/component/helper/MetaHelper');

module.exports = class MetaHelper extends Base {

    static resolveInteger (value, defaults, max = Number.MAX_SAFE_INTEGER) {
        return !Number.isSafeInteger(value) ? defaults : value > max ? max : value;
    }
};