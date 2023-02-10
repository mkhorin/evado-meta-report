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
        const jsonFiles = FileHelper.filterJsonFiles(files);
        const result = [];
        for (const name of jsonFiles) {
            const file = path.join(dir, name);
            try {
                const data = await FileHelper.readJsonFile(file);
                data.name = FileHelper.getBasename(name);
                result.push(data);
            } catch (err) {
                this.meta.log('error', `Invalid JSON: ${file}`, err);
            }
        }
        return result;
    }
};

const FileHelper = require('areto/helper/FileHelper');
const path = require('path');