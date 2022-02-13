/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class Title extends Base {

    parse (data, Token) {
        this._tokens = []; //
        this._staticParts = [];  // 'label: {name}', 'label: ' - static part
        const regex = new RegExp('{(.+?)}', 'g');
        let index = 0, result;
        while (result = regex.exec(data)) {
            this._tokens.push(new Token({
                title: this,
                content: result[1]
            }));
            this._staticParts.push(data.substring(index, result.index));
            index = result.index + result[0].length;
        }
        this._staticParts.push(data.substring(index));
    }

    async resolve (models) {
        for (const model of models) {
            model.header.tokenValues = [];
        }
        for (const token of this._tokens) {
            await token.resolve(models);
        }
        for (const model of models) {
            let result = this._staticParts[0];
            let tokenValues = model.header.tokenValues;
            for (let i = 0; i < tokenValues.length; ++i) {
                result = `${result}${tokenValues[i]}${this._staticParts[i + 1]}`;
            }
            this.assignResult(model, result);
        }
    }

    log (type, message, ...args) {
        this.owner.log(type, this.wrapClassMessage(message), ...args);
    }
};