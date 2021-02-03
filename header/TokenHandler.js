/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class TokenHandler extends Base {

    constructor (config) {
        super({
            paramStart: '[',
            paramSeparator: '][',
            paramAssign: '=>',
            ...config
        });
        this.formatter = this.token.module.get('formatter');
        this.nestedHandlers = [];
        this.parse();
        if (this.method === this.asMap) {
            this.createNestedHandlers();
        }
    }

    createNestedHandlers () {
        for (const data of Object.values(this.params)) {
            this.nestedHandlers.push(new TokenHandler({
                parent: this,
                data,
                token: this.token,
                paramStart: '(',
                paramSeparator: ')(',
                paramAssign: '->'
            }));
        }
    }

    parse () {
        this.data = typeof this.data === 'string' ? this.data.trim() : '';
        const index = this.data.indexOf(this.paramStart);
        const name = (index !== -1 ? this.data.substring(0, index) : this.data).trim();
        this.method = this.getMethod(name);
        if (!this.method) {
            this.method = this.formatter[this.formatter.getMethodName(name)];
            if (this.method) {
                this.method = this.method.bind(this.formatter);
            } else {
                this.log('error', `Method not found: ${this.data}`);
            }
        }
        // trim start and end chars
        const parts = index !== -1
            ? this.data.substring(index + 1, this.data.length - 1)
            : '';
        this.params = {};
        for (let param of parts.split(this.paramSeparator)) {
            param = param.split(this.paramAssign);
            this.params[param[0].trim()] = param[1];
        }
    }

    getMethod (name) {
        name = `as${StringHelper.toFirstUpperCase(name)}`;
        return typeof this[name] === 'function' ? this[name] : null;
    }

    execute (value, model) {
        return this.method
            ? this.method.call(this, value, this.params, model)
            : value;
    }

    log (type, message, ...args) {
        return this.token.log(type, this.wrapClassMessage(message), ...args);
    }

    // METHODS

    asJoin (value) {
        return Array.isArray(value) ? value.join(this.params.separator) : value;
    }

    asMap (value, params, model) {
        if (!Array.isArray(value)) {
            return value;
        }
        return value.map(value => {
            for (const handler of this.nestedHandlers) {
                value = handler.execute(value, model);
            }
            return value;
        });
    }

    asRaw (value, params, model) {
        return this.token.firstAttr ? model.get(this.token.firstAttr.name) : value;
    }

    asEnum (value) {
        return this.token.firstAttr?.enum
            ? this.token.firstAttr.enum.getText(value)
            : value;
    }

    asLowerCase (value) {
        return typeof value === 'string' ? value.toLowerCase() : value;
    }

    asUpperCase (value) {
        return typeof value === 'string' ? value.toUpperCase() : value;
    }
};

const StringHelper = require('areto/helper/StringHelper');