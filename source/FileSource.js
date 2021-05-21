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
        return {
            report: await this.loadReports()
        };
    }

    async loadReports () {
        const dir = this.meta.getPath(this.reportDirectory);
        const files = await FileHelper.readDirectory(dir);
        const result = [];
        for (const file of FileHelper.filterJsonFiles(files)) {
            try {
                const data = await FileHelper.readJsonFile(path.join(dir, file));
                data.name = FileHelper.getBasename(file);
                result.push(data);
            } catch (err) {
                this.meta.log('error', `Invalid JSON: ${path.join(dir, file)}`, err);
            }
        }
        return result;
    }
};

const FileHelper = require('areto/helper/FileHelper');
const path = require('path');