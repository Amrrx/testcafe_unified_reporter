"use strict";
const TestCaseModel = require("../models/TestCaseModel")
const TestRunModel = require("../models/TestRunModel")
const logger = require("../logger");

module.exports = class TestRailInstance {
   constructor(testRailCore, configObject) {
      this.railCore = testRailCore;
      this.userConfigs = configObject
   }

   async createTokenDetails() {
      let session_ID = await this.railCore.initateAuthenticationToken();
      let user_ID = await this.railCore.getUserID(session_ID);
      return {
         sessionID: await session_ID,
         userID: await user_ID,
      };
   }

   async prepareRunData(token, testObject) {
      let runObject = [];
      for (let element of testObject.testFixtures) {
         runObject.push({
            runInstance: await this.#createRunObject(await token, await element),
            runResults: await this.#createTestResultsObject(await element.fTests),
         });
      }
      return runObject;
   }

   async pushNewRun(token, runObject) {
      for (let testRun of runObject) {
         let runData = await this.railCore.pushNewTestRun(await token.sessionID, await testRun.runInstance.project_ID, await testRun.runInstance.runObject);
         testRun["runID"] = runData.id;
         logger("Created Run object with: " + "ID: " + runData.id + " ProjectID: " + testRun.runInstance.project_ID);
      }
   }

   async pushTestResults(token, runObject) {
      for (let testRun of runObject) {
         let testResult = await this.railCore.updateTestRunResults(await token.sessionID, await testRun.runID, await testRun.runResults);
         logger("Run results of " + "ID: " + testRun.runID + " updated with ID: " + testResult.data[0].id);
      }
   }

   async #createRunObject(token, fixtureObject) {
      let projectID = await this.railCore.getProjectIDS(await token.sessionID, fixtureObject.fMeta[this.userConfigs.metaConfig.projectMeta]);
      let milestoneID = await this.railCore.getMileStoneID(await token.sessionID, await projectID, fixtureObject.fMeta[this.userConfigs.metaConfig.milestoneMeta]);
      let suiteID = await this.railCore.getSuiteID(await token.sessionID, await projectID, fixtureObject.fMeta[this.userConfigs.metaConfig.suiteMeta]);
      let casesID = await this.#getTestCasesIDs(fixtureObject);
      return {
         project_ID: await projectID,
         runObject: new TestRunModel(await suiteID, await fixtureObject.name, await token.userID, casesID, await milestoneID, "Auto created defect by Unified reporter v1.1"),
      };
   }

   async #createTestResultsObject(testsArrayObject) {
      let testResults = [];
      for (let testCase of testsArrayObject) {
         testResults.push(
            new TestCaseModel(
               testCase.tMeta[this.userConfigs.metaConfig.testcaseID],
               await this.#checkTestCaseStatus(testCase.runInfo.errs),
               testCase.tName,
               await this.#convertTestCaseTime(testCase.runInfo.durationMs)
            )
         );
      }
      return testResults;
   }

   async #checkTestCaseStatus(testCaseErrs) {
      if (testCaseErrs.length === 0) {
         return 1;
      } else {
         return 5;
      }
   }

   async #convertTestCaseTime(testCaseMs) {
      return Math.floor(testCaseMs / 60000);
   }

   async #getTestCasesIDs(fixtureObject) {
      let casesArray = [];
      for (let element of await fixtureObject.fTests) {
         casesArray.push(element.tMeta[this.userConfigs.metaConfig.testcaseID]);
      }
      return casesArray;
   }
};
