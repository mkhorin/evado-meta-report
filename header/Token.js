/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 *
 * {$self::handler1::handler2}
 * {$self::toUpperCase::handler2}
 * {town.name::handler1[param1=>value1][param2=>value2]}
 * {towns::join[separator=>, ]}
 * {towns::map[param1=>toUpperCase(param1->value1)(param2->value2)]}
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class Token extends Base {

    constructor (config) {
        super(config);
        const data = this.content.split('::');
        const cls = this.initAttrs(data.shift().split('.'), this.header.owner.report);
        this.module = cls.meta.module;
        this.formatter = this.module.get('formatter');
        this.firstAttr = this.attrs[0];
        this.lastAttr = this.attrs[this.attrs.length - 1];
        this.handlers = data.map(data => new TokenHandler({token: this, data}));
    }

    initAttrs (names, cls) {
        this.attrs = [];
        for (let i = 0; i < names.length; ++i) {
            const name = names[i];
            const attr = cls.getAttr(name);
            if (!attr) {
                this.log('error', `Attribute not found: ${name}`);
                break;
            }
            if (attr.relation) {
                if (attr.relation.refClass) {
                    cls = attr.relation.refClass;
                } else {
                    this.log('error', `Attribute has no refClass: ${attr.id}`);
                    break;
                }
            } else if (i + 1 < names.length) {
                this.log('error', `Attribute is not relation: ${attr.id}`);
                break;
            }
            this.attrs.push(attr);
        }
        return cls;
    }

    async resolve (models) {
        if (!this.firstAttr || !models.length) {
            return;
        }
        if (this.firstAttr.calc) {
            const value = models[0].get(this.firstAttr.name);
            if (value === undefined) {
                await this.firstAttr.calc.resolve(models);
            }
        }
        this.assignValues(models);
    }

    assignValues (models) {
        for (const model of models) {
            const value = model.get(this.firstAttr);
            const result = this.executeHandlers(value, model);
            model.header.tokenValues.push(result);
        }
    }

    executeHandlers (value, model) {
        for (const handler of this.handlers) {
            value = handler.execute(value, model);
        }
        if (Array.isArray(value)) {
            return value.join('<br>');
        }
        return value === null || value === undefined ? '' : value;
    }

    log (type, message, ...args) {
        return this.header.log(type, this.wrapClassMessage(message), ...args);
    }

    // TODO
    // name.sub[handler1[p1=v1][p2=v2]][handler2[p1=[nestedHandler[p1=v1][p2=v2]]]]
    // { name.sub: { handler1: { p1: v1, p2: v2 }, handler2: { p1: { nestedHandler: { p1: v1, p2: v2 }}}}}

    parse (data) {
        data = typeof data === 'string' ? data.trim() : '';
        const index = data.indexOf('[');
        const name = index !== -1 ? data.substring(0, index) : data;
        data = index !== -1 ? data.substring(index + 1, data.length - 1) : '';
        const handlers = data ? TokenHandler.parse(data) : [];
        return {name, handlers};
    }
};

const TokenHandler = require('./TokenHandler');