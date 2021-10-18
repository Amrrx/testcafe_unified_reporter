"use strict";
const logger = require("../logger");

module.exports = class AllureInstance {
    constructor(testRailCore, configObject) {
        this.allureConfig = configObject;
        this.allureReport = testRailCore;
    }

    async generateReport(testObject) {
        this.allureReport.setTaskStartData(testObject.reportStart, testObject.reportAgent, testObject.testsCount)
        testObject.testFixtures.forEach((fixture) => {
            this.allureReport.createNewSuite(fixture.name)
            fixture.fTests.forEach((test) => {
                this.allureReport.createNewTestCase(test.tName, 0)
                testObject.reportAgent.forEach((agent) => this.allureReport.addTestEnvironment("User Agent", agent))
                allureCore.addTestDescription(this.getTestCaseDescription(test.tMeta[this.allureConfig.metaConfig.testcaseID]));
                this.allureReport.addTestLabel('severity', test.tMeta[this.allureConfig.metaConfig.severityMeta]);
                allureCore.addTestTag(test.tMeta[this.allureConfig.metaConfig.testcaseID])
                let testInfo = this.identifyTestCaseStatus(test)
                this.allureReport.endTestCaseData(testInfo.status, { "message": testInfo.message, "stack": testInfo.stack }, test.runInfo.durationMs)
            })
            this.allureReport.endTestSuite()
        })
    }

    countTestsInTestObject(testObject) {
        return testObject.testFixtures.reduce((fixture, next) => fixture.fTests.length + next.fTests.length)
    }

    getTestCaseDescription(testCaseID) {
        return 'This is just a description'
    }

    identifyTestCaseStatus(testCase) {
        if (testCase.runInfo.skipped) {
            return { status: "skipped", message: "This test has been skipped.", stack: "This test has been skipped." }
        }
        else if (testCase.runInfo.errs.length == 0) {
            return { status: "passed", message: "This test has been passed.", stack: "This test has been passed." }
        }
        else if (testCase.runInfo.errs.length > 0) {
            // this.addScreenshot(testCafeErrorObject.screenshotPath);
            return { status: "failed", message: "This test has been broken.", stack: "This test has been broken." }
        }
    }
}

