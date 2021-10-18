'use strict';
Object.defineProperty(exports, '__esModule', {
    value: true
});
const { TYPE } = require('allure-js-commons');
var Allure = require('allure-js-commons');
const allureReportInstance = require("../models/AllureReportModel");

const allureReporter = new Allure()

module.exports = class AllureCore {
    constructor(configObject) {
        //  this.allureConfig = configObject.allure;
        this.allureReport = new allureReportInstance();
    }

    setTaskStartData(startTime, userAgents, testCount) {
        this.allureReport.startTime = startTime;
        this.allureReport.userAgents = userAgents;
        this.allureReport.total = testCount;
    }

    createNewSuite(suiteName) {
        allureReporter.startSuite(suiteName);
    }

    createNewTestCase(testCaseTitle, testCaseStartTime) {
        allureReporter.startCase(testCaseTitle, testCaseStartTime);
    }

    endTestCaseData(testStatus, testInfo, testEndTime) {
        allureReporter.endCase(testStatus, testInfo, testEndTime);
    }

    addTestEnvironment(environmentName, environmentValue) {
        allureReporter.getCurrentTest().addParameter("environment-variable", environmentName, environmentValue)
    }

    addTestLabel(name, value) {
        allureReporter.getCurrentTest().addLabel(name, value)
    }

    addTestArgument(name, value) {
        allureReporter.getCurrentTest().addParameter("argument", name, value)
    }

    addTestDescription(value){
        allureReporter.getCurrentTest().setDescription(value, "TEXT")
    }

    addTestTag(value){
        allureReporter.getCurrentTest().addLabel("tag", value)
    }

    addTaskInfo(endTime, passed, warnings) {
        this.allureReport.passed = passed;
        this.allureReport.endTime = endTime;
        this.allureReport.warnings = warnings;
    }

    addTest(){
        
    }
    
    endTestSuite() {
        allureReporter.endSuite();
    }

}