/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('./BaseSource');

module.exports = class FileSource extends Base {

    constructor (config) {
        super({
            reportDirectory: 'report',
            ...config
        });
    }

    async load () {
        this.clear();
        await this.loadReports();
        return this._data;
    }

    loadReports () {
        return this.loadJsonItems('report', this.reportDirectory);
    }

    async loadJsonItems (type, dir) {
        dir = this.meta.getPath(dir);
        const files = await FileHelper.readDirectory(dir);
        for (const file of FileHelper.filterJsonFiles(files)) {
            try {
                const data = await FileHelper.readJsonFile(path.join(dir, file));
                data.name = FileHelper.getBasename(file);
                this._data[type].push(data);
            } catch (err) {
                this.meta.log('error', `Invalid JSON: ${path.join(dir, file)}`, err);
            }
        }
    }
};

const path = require('path');
const FileHelper = require('areto/helper/FileHelper');