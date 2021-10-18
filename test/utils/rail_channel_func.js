const globalConfigs = require("../../src/config.json");
const TestrailCore = require("../../src/core/TestrailCore.js");
const TestRailInstance = require("../../src/channels/TestRailInstance.js");
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
module.exports = {
        returnObject: {
                "auth": {
                        "testRailBaseURL": process.env.testRailBaseURL,
                        "railUsername": process.env.railUsername,
                        "railPassword": process.env.railPassword
                },
                "metaConfig": {
                        "projectMeta": "Project_Name",
                        "suiteMeta": "Suite_Name",
                        "milestoneMeta": "MileStone_Name",
                        "testcaseID": "testcase_ID",
                        "componentMeta": "targetComponent",
                        "projectKeyMeta": "jiraProjectKey",
                        "priorityMeta": "testPriority",
                        "severityMeta": "testSeverity",
                        "labelsMeta": "testLabels",
                        "fixtureIDMeta": "fixtureID"
                }

        },

        async createAuthenticationToken() {
                const railCore = new TestrailCore(globalConfigs.testrail, this.returnObject.auth)
                const railObject = new TestRailInstance(railCore, globalConfigs);
                const authToken = await railObject.createTokenDetails();
                return authToken
        },

        async getProjectID(cookies, projectName) {
                const railCore = new TestrailCore(globalConfigs.testrail, this.returnObject.auth)
                return railCore.getProjectIDS(cookies, projectName)
        },

        async getMilestoneID(cookies, projectID, milestoneNam) {
                const railCore = new TestrailCore(globalConfigs.testrail, this.returnObject.auth)
                return railCore.getMileStoneID(cookies, projectID, milestoneNam)
        },

        async getSuiteID(cookies, projectID, suiteID) {
                const railCore = new TestrailCore(globalConfigs.testrail, this.returnObject.auth)
                return railCore.getSuiteID(cookies, projectID, suiteID)
        },

        async getUserID(cookies) {
                const railCore = new TestrailCore(globalConfigs.testrail, this.returnObject.auth)
                return railCore.getUserID(cookies)
        },

        async createNewTestRun(sessionID, projectID, testRunObject) {
                const railCore = new TestrailCore(globalConfigs.testrail, this.returnObject.auth)
                return await railCore.pushNewTestRun(
                        await sessionID,
                        await projectID,
                        testRunObject
                );
        },

        async updateTestRunResult(sessionID, testRunID, testCasesArray) {
                const railCore = new TestrailCore(globalConfigs.testrail, this.returnObject.auth)
                return await railCore.updateTestRunResults(
                        await sessionID,
                        await testRunID,
                        testCasesArray
                );
        },

        async getTestCaseData(sessionID, testRunID) {
                const railCore = new TestrailCore(globalConfigs.testrail, this.returnObject.auth)
                return await railCore.getTestCaseByID(
                        await sessionID,
                        await testRunID
                );
        }
}