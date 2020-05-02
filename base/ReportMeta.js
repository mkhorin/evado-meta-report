/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('evado/component/meta/MetaModel');

module.exports = class ReportMeta extends Base {

    constructor (config) {
        super({
            name: 'report',
            source: {Class: require('../source/FileSource')},
            dataTablePrefix: 'r_',
            ...config
        });
        this.createSource(this.source);
    }

    getReport (name) {
        return this.reportMap[name] instanceof Report && this.reportMap[name];
    }

    getAttr (id) { // attr.report
        if (typeof id !== 'string') {
            return null;
        }
        let [attr, report] = id.split('.');
        report = this.getReport(report);
        return report ? report.getAttr(attr) : null;
    }

    getDataTables () {
        return this.reports.map(report => report.getTable());
    }

    // LOAD

    async load () {
        await super.load();
        this.createReports();
        this.prepareReports();
        this.createDeferredBinding();
        this.prepareBehaviors();
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
        if (this.getReport(data.name)) {
            return this.log('error', `Report already exists: ${data.name}`);
        }
        this.reportMap[data.name] = new Report({meta: this, data});
        this.reports.push(this.reportMap[data.name]);
    }

    prepareReports () {
        this.reports.forEach(item => item.prepare());
    }

    createDeferredBinding () {
    }

    prepareBehaviors () {
        for (const report of this.reports) {
            Behavior.createConfigurations(report);
            report.prepareBehaviors();
        }
    }

    async createIndexes () {
        for (const report of this.reports) {
            await report.indexes.create();
        }
    }

    processReportMethod (...methods) {
        for (const method of methods) {
            for (const report of this.reports) {
                report[method]();
            }
        }
    }

    async dropData () {
        for (const report of this.reports) {
            await report.dropData();
        }
        await this.dropTablesByPrefix(this.dataTablePrefix);
    }
};

const Behavior = require('../behavior/Behavior');
const Report = require('./Report');