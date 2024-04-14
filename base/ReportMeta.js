/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('evado/component/meta/MetaModel');

module.exports = class ReportMeta extends Base {

    constructor (config) {
        super({
            name: 'report',
            source: {
                Class: require('../source/FileSource')
            },
            dataTablePrefix: 'r_',
            ...config
        });
        this.createSource(this.source);
    }

    getReport (name) {
        return this.reportMap[name] instanceof Report ? this.reportMap[name] : null;
    }

    /**
     * @param id - attr.report
     */
    getAttr (id) {
        if (typeof id === 'string') {
            const [attr, report] = id.split('.');
            return this.getReport(report)?.getAttr(attr);
        }
    }

    getDataTables () {
        return this.reports.map(report => report.getTable());
    }

    // LOAD

    async load () {
        await super.load();
        this.createReports();
        await this.createDeferredBinding();
        /*if (this.Inspector) {
            await this.Inspector.execute(this);
        }*/
    }

    createReports () {
        this.reports = [];
        this.reportMap = {};
        this.data.report.forEach(this.createReport, this);
    }

    createReport (data) {
        const {name} = data;
        if (this.getReport(name)) {
            return this.log('error', `Report already exists: ${name}`);
        }
        this.reportMap[name] = new Report({meta: this, data});
        this.reports.push(this.reportMap[name]);
    }

    async createDeferredBinding () {
        await this.processReportMethods([
            'createAttrs',
            'createMinerConfig',
            'createBehaviors',
            'prepareAttrs'
        ]);
    }

    async processReportMethods (methods) {
        for (const method of methods) {
            for (const report of this.reports) {
                await report[method]();
            }
        }
    }

    async createIndexes () {
        for (const report of this.reports) {
            await report.indexes.create();
        }
    }

    async dropData () {
        for (const report of this.reports) {
            await report.dropData();
        }
        await this.dropTablesByPrefix(this.dataTablePrefix);
    }
};

const Report = require('./Report');