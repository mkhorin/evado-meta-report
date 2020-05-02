/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class BaseMiner extends Base {

    static delay (duration = 100) {
        return PromiseHelper.setTimeout(duration);
    }

    constructor (config) {
        super(config);
        this.report = this.model.getMetaReport();
        this.reportMeta = this.report.getMeta();
        this.metaHub = this.reportMeta.hub;
        this.baseMeta = this.metaHub.get('base');
    }

    isStarted () {
        return this._started;
    }

    async start () {
        if (this.isStarted()) {
            return false;
        }
        this._started = true;
        await this.beforeRun();
        await this.run();
        await this.afterRun();
    }

    async stop () {
        if (this.isStarted()) {
            this._started = false;
            await this.deleteData();
        }
    }

    async run () {
        throw new Error('Place miner code here');
    }

    beforeRun () {
        this.startTime = new Date;
    }

    afterRun () {        
        this.duration = Date.now() - this.startTime.getTime();
    }

    createDataModel () {
        return this.report.createDataModel({module: this.module});
    }

    insertData (data) {
        this.addModelValue(data);
        return this.report.insert(data);
    }

    addModelValue (values) {
        for (const data of values) {
            data[this.report.OWNER_ATTR] = this.model.getId();
        }
    }

    deleteData () {
        return this.report.findByOwner(this.model.getId(), this.module).delete();
    }

    log () {
        CommonHelper.log(this.baseMeta, this.constructor.name, ...arguments);
    }
};
module.exports.init();

const CommonHelper = require('areto/helper/CommonHelper');
const PromiseHelper = require('areto/helper/PromiseHelper');